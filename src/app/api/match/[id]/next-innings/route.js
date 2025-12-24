// /api/match/[id]/next-innings/route.js - FIXED
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Score from "@/models/Score";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const match = await Match.findById(id).populate("scores");

    if (!match) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
    }

    if (match.currentInnings === 1) {
      // Start 2nd Innings
      const firstInnings = match.scores[0];

      if (!firstInnings.isCompleted) {
        return NextResponse.json(
          { success: false, error: "First innings not completed" },
          { status: 400 }
        );
      }

      const secondInnings = await Score.create({
        match: match._id,
        innings: 2,
        battingTeam: firstInnings.bowlingTeam,
        bowlingTeam: firstInnings.battingTeam,
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        target: firstInnings.runs + 1,
        currentBatsmen: [],
        bowlersPerformance: [],
        scoreEveryBall: [],
      });

      match.scores.push(secondInnings._id);
      match.currentInnings = 2;
      match.state = "2nd-innings";
      match.battingTeam = firstInnings.bowlingTeam;
      match.bowlingTeam = firstInnings.battingTeam;

      await match.save();

      return NextResponse.json({
        success: true,
        finished: false,
        message: "Second innings started",
      });
    } else if (match.currentInnings === 2) {
      // Match Over - Calculate Winner
      const [innings1, innings2] = match.scores;

      match.state = "finished";

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

      return NextResponse.json({
        success: true,
        finished: true,
        winner: match.winner,
        winningMargin: match.winningMargin,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid innings state" }, { status: 400 });
  } catch (err) {
    console.error("Next innings error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
