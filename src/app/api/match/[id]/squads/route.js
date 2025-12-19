import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const match = await Match.findById(id).populate({
      path: "teams",
      populate: [
        { path: "players", select: "name _id" },
        { path: "captain", select: "name _id" },
        { path: "wicketKeeper", select: "name _id" },
      ],
    });

    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    const squads = match.teams.map((team) => ({
      _id: team._id,
      name: team.name,
      players: team.players.map((p) => ({ _id: p._id, name: p.name })),
      captain: team.captain ? { _id: team.captain._id, name: team.captain.name } : null,
      wicketKeeper: team.wicketKeeper
        ? { _id: team.wicketKeeper._id, name: team.wicketKeeper.name }
        : null,
    }));

    return NextResponse.json({ success: true, squads });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch squads" },
      { status: 500 }
    );
  }
}
