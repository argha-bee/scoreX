import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function GET(req) {
  try {
    await connectDB();

    const matches = await Match.find({})
      .populate({
        path: "teams",
        select: "name shortName players captain wicketKeeper",
        populate: {
          path: "players",
          select: "name role battingStyle bowlingStyle jerseyNumber",
        },
      })
      .populate("scorer", "username")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
