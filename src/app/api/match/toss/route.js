// app/api/match/[id]/toss/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path if needed
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Score from "@/models/Score";

// POST /api/match/[id]/toss
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = params; // App Router gives URL params here
    const body = await req.json();
    const { tossWinner, tossDecision } = body;

    const match = await Match.findById(id).populate("teams");

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    if (match.scorer.toString() !== session.user.id) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    // Update match with toss details
    match.tossWinner = tossWinner;
    match.tossDecision = tossDecision;
    match.status = "in-progress";

    const winnerTeam = match.teams.find((t) => t._id.toString() === tossWinner);
    const loserTeam = match.teams.find((t) => t._id.toString() !== tossWinner);

    if (tossDecision === "bat") {
      match.battingTeam = winnerTeam._id;
      match.bowlingTeam = loserTeam._id;
    } else {
      match.battingTeam = loserTeam._id;
      match.bowlingTeam = winnerTeam._id;
    }

    await match.save();

    // Create first innings score
    const score = await Score.create({
      match: match._id,
      innings: 1,
      battingTeam: match.battingTeam,
      bowlingTeam: match.bowlingTeam,
    });

    match.scores.push(score._id);
    await match.save();

    return NextResponse.json({ message: "Toss completed", match, score });
  } catch (error) {
    console.error("Toss error:", error);
    return NextResponse.json(
      { message: "Error completing toss", error: error.message },
      { status: 500 }
    );
  }
}
