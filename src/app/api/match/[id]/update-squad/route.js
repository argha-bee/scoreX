import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const teams = await req.json(); // returning the whole team object thats getting from the frontend payload

    console.log("teams at update-squad ===> \n", teams);
    if (!teams) {
      return NextResponse.json(
        { success: false, message: "Teams' data missing." },
        { status: 400 }
      );
    }

    const match = await Match.findById(id).populate("teams");
    // console.log(match);

    const team1 = match.teams.find();
    if (!match)
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });

    for (let i = 0; i < 2; i++) {
      const t = match.teams[i];
      const inputTeam = teams[i];

      if (!inputTeam) continue;

      // Fetch player docs
      const playerDocs = await Player.find({
        name: { $in: inputTeam.players },
        team: t._id,
      });

      const playerIds = playerDocs.map((p) => p._id);
      const captainDoc = playerDocs.find((p) => p.name === inputTeam.captain);
      const wkDoc = playerDocs.find((p) => p.name === inputTeam.wicketKeeper);

      if (!captainDoc || !wkDoc)
        return NextResponse.json(
          { success: false, message: `Invalid captain or WK for ${t.name}` },
          { status: 400 }
        );

      // Update team
      t.players = playerIds;
      t.captain = captainDoc._id;
      t.wicketKeeper = wkDoc._id;
      t.ready = playerIds.length === 11 && !!captainDoc && !!wkDoc;
      await t.save();
    }

    // Update match status if both teams ready
    const allReady = match.teams.every((t) => t.ready);
    if (allReady && match.status === "upcoming") {
      match.status = "ready-to-start";
      await match.save();
    }

    return NextResponse.json({
      success: true,
      message: "Squads updated",
      match: await Match.findById(id).populate("teams"),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to update squads" },
      { status: 500 }
    );
  }
}
