import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Score from "@/models/Score";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const match = await Match.findById(id).populate("scores");

    let isMatchOver = false;
    let winner = null;

    if (match.currentInnings === 1) {
      // Setup 2nd Innings
      const firstInnings = match.scores[0];
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
      });

      match.scores.push(secondInnings._id);
      match.currentInnings = 2;
      match.state = "2nd-innings";
      await match.save();
      return NextResponse.json({ success: true, finished: false });
    } else {
      // Match Over
      match.state = "finished";
      const s1 = match.scores[0].runs;
      const s2 = match.scores[1].runs;
      match.winner = s1 > s2 ? match.scores[0].battingTeam : match.scores[1].battingTeam;
      await match.save();
      return NextResponse.json({ success: true, finished: true });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
