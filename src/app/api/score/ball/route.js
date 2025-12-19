import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import Score from "@/models/Score";
import Match from "@/models/Match";
import Player from "@/models/Player";
import Ball from "@/models/Ball";
import { broadcastScoreUpdate } from "@/lib/websocket";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { scoreId, runs, extras, isWicket, wicketType, dismissedPlayer, fielder, commentary } =
      req.body;

    const score = await Score.findById(scoreId).populate("match");

    if (!score) {
      return res.status(404).json({ message: "Score not found" });
    }

    const match = await Match.findById(score.match._id);

    if (match.scorer.toString() !== session.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get current batsman and bowler
    const onStrikeBatsman = score.currentBatsmen.find((b) => b.onStrike);
    const currentBowler = score.currentBowler;

    if (!onStrikeBatsman || !currentBowler) {
      return res.status(400).json({ message: "Batsman and bowler must be selected" });
    }

    // Calculate ball number
    const currentBallNumber = (score.balls % 6) + 1;
    const isLegalDelivery = !extras?.type || ["bye", "leg-bye"].includes(extras?.type);

    // Create ball record
    const ball = await Ball.create({
      match: match._id,
      score: score._id,
      innings: score.innings,
      overNumber: score.overs,
      ballNumber: currentBallNumber,
      batsman: onStrikeBatsman.player._id,
      bowler: currentBowler,
      runs: runs || 0,
      extras: extras || { type: "", runs: 0 },
      isWicket: isWicket || false,
      wicketType: wicketType || "",
      dismissedPlayer: dismissedPlayer || null,
      fielder: fielder || null,
      isFour: runs === 4,
      isSix: runs === 6,
      isLegalDelivery,
      commentary: commentary || "",
    });

    // Update score
    const totalRuns = (runs || 0) + (extras?.runs || 0);
    score.runs += totalRuns;

    // Update extras
    if (extras?.type) {
      switch (extras.type) {
        case "wide":
          score.extras.wides += extras.runs;
          break;
        case "no-ball":
          score.extras.noBalls += extras.runs;
          break;
        case "bye":
          score.extras.byes += extras.runs;
          break;
        case "leg-bye":
          score.extras.legByes += extras.runs;
          break;
      }
      score.extras.total += extras.runs;
    }

    // Update ball count only for legal deliveries
    if (isLegalDelivery) {
      score.balls += 1;

      // Check if over is complete
      if (score.balls % 6 === 0) {
        score.overs += 1;
        score.balls = 0;
        score.currentOver = { overNumber: score.overs, balls: [] };
      }
    }

    // Add ball to current over
    score.currentOver.balls.push(ball._id);

    // Update batsman stats
    const batsman = await Player.findById(onStrikeBatsman.player._id);
    if (isLegalDelivery) {
      batsman.battingStats.balls += 1;
    }
    batsman.battingStats.runs += runs || 0;
    if (runs === 4) batsman.battingStats.fours += 1;
    if (runs === 6) batsman.battingStats.sixes += 1;
    batsman.calculateStrikeRate();

    // Handle wicket
    if (isWicket) {
      score.wickets += 1;
      batsman.battingStats.isOut = true;
      batsman.battingStats.dismissalType = wicketType;

      if (wicketType === "caught") {
        batsman.battingStats.dismissedBy = currentBowler;
        batsman.battingStats.caughtBy = fielder;
      } else if (["bowled", "lbw", "stumped"].includes(wicketType)) {
        batsman.battingStats.dismissedBy = currentBowler;
      }

      // Add to fall of wickets
      score.fallOfWickets.push({
        player: batsman._id,
        runs: score.runs,
        overs: score.overs,
        balls: score.balls,
      });

      // Remove batsman from current batsmen
      score.currentBatsmen = score.currentBatsmen.filter(
        (b) => b.player._id.toString() !== batsman._id.toString()
      );
    }

    await batsman.save();

    // Update bowler stats
    const bowler = await Player.findById(currentBowler);
    if (isLegalDelivery) {
      bowler.bowlingStats.balls += 1;
      if (bowler.bowlingStats.balls % 6 === 0) {
        bowler.bowlingStats.overs += 1;
        bowler.bowlingStats.balls = 0;
      }
    }
    bowler.bowlingStats.runs += runs || 0;
    if (isWicket && ["bowled", "caught", "lbw", "stumped"].includes(wicketType)) {
      bowler.bowlingStats.wickets += 1;
    }
    if (extras?.type === "wide") {
      bowler.bowlingStats.wides += 1;
    }
    if (extras?.type === "no-ball") {
      bowler.bowlingStats.noBalls += 1;
    }
    bowler.calculateEconomy();
    await bowler.save();

    // Change strike for odd runs
    if (isLegalDelivery && runs % 2 !== 0) {
      score.currentBatsmen.forEach((b) => {
        b.onStrike = !b.onStrike;
      });
    }

    // Calculate run rate
    score.calculateRunRate();

    await score.save();

    // Check if innings is complete
    if (score.wickets >= match.totalWickets || score.overs >= match.overs) {
      score.isCompleted = true;
      await score.save();

      // Check if match is complete or start next innings
      if (score.innings === 2 || (match.format === "Test" && score.innings === 4)) {
        match.status = "completed";
        // Calculate winner logic here
      } else {
        match.status = "innings-break";
        match.currentInnings += 1;
      }
      await match.save();
    }

    // Broadcast update via WebSocket
    broadcastScoreUpdate(match._id.toString(), {
      score,
      ball,
      batsman,
      bowler,
    });

    res.status(201).json({
      message: "Ball recorded successfully",
      ball,
      score,
      batsman,
      bowler,
    });
  } catch (error) {
    console.error("Ball recording error:", error);
    res.status(500).json({ message: "Error recording ball", error: error.message });
  }
}
