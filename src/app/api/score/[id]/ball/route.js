import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Score from "@/models/Score";
import Match from "@/models/Match";
import Ball from "@/models/Ball";
import Player from "@/models/Player";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { runs, extraType, extraRuns, isWicket, wicketType, fielderId } = await req.json();

    const score = await Score.findById(id).populate("currentBatsmen.player");
    if (!score) {
      return NextResponse.json({ success: false, error: "Score not found" }, { status: 404 });
    }
    if (score.isCompleted) {
      return NextResponse.json({ success: false, error: "Innings completed" }, { status: 400 });
    }

    const match = await Match.findById(score.match);
    if (match.state === "finished") {
      return NextResponse.json({ success: false, error: "Match finished" }, { status: 400 });
    }

    const strikerObj = score.currentBatsmen.find((b) => b.onStrike);
    const nonStrikerObj = score.currentBatsmen.find((b) => !b.onStrike);

    if (!strikerObj || !score.currentBowler) {
      return NextResponse.json(
        { success: false, error: "Select Striker and Bowler" },
        { status: 400 }
      );
    }

    const striker = await Player.findById(strikerObj.player._id);
    const bowler = await Player.findById(score.currentBowler);

    let isValidBall = true;
    let totalExtraRuns = 0;
    let ballRuns = runs || 0;

    if (extraType === "WD" || extraType === "NB") {
      isValidBall = false;
      totalExtraRuns = 1 + (extraRuns || 0);
      score.runs += totalExtraRuns;
      score.extras.total += totalExtraRuns;

      if (extraType === "WD") {
        score.extras.wides += totalExtraRuns;
        bowler.bowlingStats.wides += 1;
      } else {
        bowler.bowlingStats.noBalls += 1;
      }

      bowler.bowlingStats.runs += totalExtraRuns;

      if (extraType === "NB" && extraRuns > 0) {
        striker.battingStats.runs += extraRuns;
        strikerObj.runs += extraRuns;
        if (extraRuns === 4) striker.battingStats.fours += 1;
        if (extraRuns === 6) striker.battingStats.sixes += 1;
      }
    } else if (extraType === "B" || extraType === "LB") {
      isValidBall = true;
      score.runs += ballRuns;
      score.balls += 1;
      score.extras.total += ballRuns;

      if (extraType === "B") {
        score.extras.byes += ballRuns;
      } else {
        score.extras.legByes += ballRuns;
      }

      strikerObj.balls += 1;
      striker.battingStats.balls += 1;
      bowler.bowlingStats.runs += ballRuns;
    } else {
      isValidBall = true;
      score.runs += ballRuns;
      score.balls += 1;

      strikerObj.runs += ballRuns;
      strikerObj.balls += 1;

      striker.battingStats.runs += ballRuns;
      striker.battingStats.balls += 1;

      if (ballRuns === 4) {
        striker.battingStats.fours += 1;
      }
      if (ballRuns === 6) {
        striker.battingStats.sixes += 1;
      }

      bowler.bowlingStats.runs += ballRuns;
    }

    if (isWicket) {
      score.wickets += 1;
      bowler.bowlingStats.wickets += 1;

      striker.battingStats.isOut = true;
      striker.battingStats.dismissalType = wicketType || "bowled";
      striker.battingStats.dismissedBy = bowler._id;

      if (fielderId && (wicketType === "caught" || wicketType === "stumped")) {
        striker.battingStats.caughtBy = fielderId;
      }

      score.currentBatsmen = score.currentBatsmen.filter(
        (b) => b.player._id.toString() !== striker._id.toString()
      );
    }

    await Ball.create({
      match: match._id,
      score: score._id,
      innings: score.innings,
      overNumber: score.overs,
      ballNumber: score.balls,
      batsman: striker._id,
      bowler: bowler._id,
      runs: extraType && extraType !== "B" && extraType !== "LB" ? 0 : ballRuns,
      extras: { type: extraType || "", runs: totalExtraRuns },
      isWicket,
      wicketType: wicketType || "",
      dismissedPlayer: isWicket ? striker._id : null,
      fielder: fielderId || null,
      isFour: ballRuns === 4 && !extraType,
      isSix: ballRuns === 6 && !extraType,
      isLegalDelivery: isValidBall,
    });

    const ballLabel = isWicket
      ? "W"
      : extraType === "WD"
      ? `${totalExtraRuns}WD`
      : extraType === "NB"
      ? `${totalExtraRuns}NB`
      : extraType === "B"
      ? `${ballRuns}B`
      : extraType === "LB"
      ? `${ballRuns}LB`
      : ballRuns.toString();
    score.scoreEveryBall.push(ballLabel);

    let bp = score.bowlersPerformance.find((b) => b.player.toString() === bowler._id.toString());
    if (!bp) {
      score.bowlersPerformance.push({
        player: bowler._id,
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
      });
      bp = score.bowlersPerformance[score.bowlersPerformance.length - 1];
    }

    if (isValidBall) {
      bp.balls += 1;
      bowler.bowlingStats.balls += 1;

      if (bp.balls === 6) {
        bp.overs += 1;
        bp.balls = 0;
        bowler.bowlingStats.overs += 1;
        bowler.bowlingStats.balls = 0;
      }
    }

    bp.runs += extraType ? totalExtraRuns : ballRuns;
    if (isWicket) bp.wickets += 1;

    let overEnded = false;

    const runsToConsider = extraType === "WD" ? extraRuns || 0 : ballRuns;
    if (!isWicket && [1, 3, 5].includes(runsToConsider)) {
      if (strikerObj && nonStrikerObj) {
        strikerObj.onStrike = false;
        nonStrikerObj.onStrike = true;
      }
    }

    if (isValidBall && score.balls === 6) {
      score.overs += 1;
      score.balls = 0;
      overEnded = true;

      score.currentBatsmen.forEach((b) => {
        b.onStrike = !b.onStrike;
      });
    }

    let inningsFinished = false;
    let matchFinished = false;

    const totalWickets = match.totalWickets || 10;
    const totalOvers = match.overs;

    if (score.wickets >= totalWickets || (score.overs >= totalOvers && score.balls === 0)) {
      score.isCompleted = true;
      inningsFinished = true;
    }

    if (match.currentInnings === 2) {
      const firstInningsScore = await Score.findOne({ match: match._id, innings: 1 });
      const target = firstInningsScore.runs + 1;

      if (score.runs >= target) {
        score.isCompleted = true;
        inningsFinished = true;
        matchFinished = true;
        match.state = "finished";
        match.winner = score.battingTeam;
        const wicketsLeft = totalWickets - score.wickets;
        match.winningMargin = `won by ${wicketsLeft} wickets`;
      } else if (inningsFinished) {
        matchFinished = true;
        match.state = "finished";
        match.winner = score.bowlingTeam;
        const runDiff = target - 1 - score.runs;
        match.winningMargin = `won by ${runDiff} runs`;
      }

      if (matchFinished) {
        await match.save();
      }
    }
    score.calculateRunRate();
    striker.calculateStrikeRate();
    bowler.calculateEconomy();

    await Promise.all([score.save(), striker.save(), bowler.save()]);

    return NextResponse.json({
      success: true,
      overEnded,
      inningsFinished,
      matchFinished,
      winningMargin: match.winningMargin,
    });
  } catch (err) {
    console.error("Ball scoring error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
