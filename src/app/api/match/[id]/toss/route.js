import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Score from "@/models/Score";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { tossWinner, decision } = await req.json();

    const match = await Match.findById(id);
    if (!match)
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });

    match.tossWinner = tossWinner;
    match.tossDecision = decision;
    match.toss = { winnerTeam: tossWinner, choice: decision };
    match.state = "toss";

    const winnerId = tossWinner.toString();

    const tossLoser = match.teams[0].equals(winnerId) ? match.teams[1] : match.teams[0];

    await match.save();

    const matchScore = await Score.findOne({ match: id, innings: 1 });
    if (matchScore) {
      matchScore.battingTeam = decision === "bat" ? tossWinner : tossLoser;
      matchScore.bowlingTeam = decision === "bat" ? tossLoser : tossWinner;
      await matchScore.save();
    }

    return NextResponse.json({ success: true, message: "Toss recorded" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to record toss" }, { status: 500 });
  }
}
