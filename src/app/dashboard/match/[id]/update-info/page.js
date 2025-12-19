import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";

export async function POST(req, { params }) {
  await connectDB();
  const { id } = await params;
  const { team1Players, team2Players } = await req.json();

  try {
    const match = await Match.findById(id).populate("teams");
    if (!match) return NextResponse.json({ message: "Match not found" }, { status: 404 });

    // Update teams' players
    if (match.teams.length === 2) {
      await Team.findByIdAndUpdate(match.teams[0]._id, { players: team1Players });
      await Team.findByIdAndUpdate(match.teams[1]._id, { players: team2Players });
    }

    match.status = "setup"; // ready for toss
    await match.save();

    return NextResponse.json({ message: "Match info updated", match });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
