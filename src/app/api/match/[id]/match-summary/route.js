// /api/match/[id]/match-summary/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Score from "@/models/Score";
import Player from "@/models/Player";
import Ball from "@/models/Ball";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const match = await Match.findById(id)
      .populate({
        path: "teams",
        populate: {
          path: "players captain wicketKeeper",
          model: Player,
        },
      })
      .populate({
        path: "scores",
        populate: [
          { path: "battingTeam bowlingTeam", model: "Team" },
          { path: "currentBatsmen.player", model: Player },
          { path: "bowlersPerformance.player", model: Player },
        ],
      })
      .populate("winner");

    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    // Get all balls for timeline
    const balls = await Ball.find({ match: id })
      .populate("batsman bowler dismissedPlayer fielder")
      .sort({ innings: 1, overNumber: 1, ballNumber: 1 });

    // Calculate match winner if not set
    if (match.state === "finished" && !match.winner && match.scores.length === 2) {
      const [innings1, innings2] = match.scores;

      if (innings1.runs > innings2.runs) {
        match.winner = innings1.battingTeam;
        match.winningMargin = `by ${innings1.runs - innings2.runs} runs`;
      } else if (innings2.runs > innings1.runs) {
        match.winner = innings2.battingTeam;
        const wicketsLeft = match.totalWickets - innings2.wickets;
        match.winningMargin = `by ${wicketsLeft} wickets`;
      } else {
        match.winningMargin = "Match Tied";
      }

      await match.save();
    }

    // Prepare summary
    const summary = {
      match: {
        _id: match._id,
        title: match.title,
        format: match.format,
        venue: match.venue,
        date: match.date,
        state: match.state,
        winner: match.winner,
        winningMargin: match.winningMargin,
      },
      teams: match.teams,
      innings: match.scores.map((score) => ({
        innings: score.innings,
        battingTeam: score.battingTeam,
        bowlingTeam: score.bowlingTeam,
        runs: score.runs,
        wickets: score.wickets,
        overs: score.overs,
        balls: score.balls,
        extras: score.extras,
        runRate: score.runRate,
        batsmen: score.currentBatsmen,
        bowlers: score.bowlersPerformance,
      })),
      ballByBall: balls,
    };

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Match Summary Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch match summary" },
      { status: 500 }
    );
  }
}
