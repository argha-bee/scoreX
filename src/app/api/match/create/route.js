import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, format, overs, venue, team1, team2 } = body;

    if (!title || !team1 || !team2 || !overs) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // 1️⃣ Create match
    const match = await Match.create({
      title,
      format,
      totalWickets: wickets,
      overs,
      venue,
      scorer: session.user.id,
      status: "setup",
    });

    // 2️⃣ Create teams
    const teamOne = await Team.create({
      name: team1.name,
      shortName: team1.shortName,
      match: match._id,
    });

    const teamTwo = await Team.create({
      name: team2.name,
      shortName: team2.shortName,
      match: match._id,
    });

    // 3️⃣ Attach teams to match
    match.teams = [teamOne._id, teamTwo._id];
    await match.save();

    return NextResponse.json(
      {
        message: "Match created successfully",
        matchId: match._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create match error:", error);
    return NextResponse.json({ message: "Failed to create match" }, { status: 500 });
  }
}
