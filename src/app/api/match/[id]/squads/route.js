import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
// import Team from "@/models/Team";
import Player from "@/models/Player";

export async function POST(req, { params }) {
  // POST = Declare squads
  return handleSquad(req, params);
}

export async function PUT(req, { params }) {
  // PUT = Update squads
  return handleSquad(req, params, true);
}

// Common function for both declare & update
async function handleSquad(req, params, isUpdate = false) {
  try {
    await connectDB();
    const { id } = await params;
    const { teams: inputTeams } = await req.json();

    if (!inputTeams) {
      return NextResponse.json({ success: false, message: "Teams data missing" }, { status: 400 });
    }

    const match = await Match.findById(id).populate("teams");
    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    for (let i = 0; i < match.teams.length; i++) {
      const team = match.teams[i];
      const inputTeam = inputTeams[i];
      if (!inputTeam) continue;

      const playerIds = [];

      for (const p of inputTeam.players) {
        const normalizedName = p.name.trim().toLowerCase();

        let playerDoc = await Player.findOne({
          name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
          jerseyNumber: p.jerseyNumber,
          team: team._id,
        });

        if (!playerDoc) {
          playerDoc = await Player.create({
            name: p.name.trim(),
            jerseyNumber: p.jerseyNumber,
            role: p.role,
            battingStyle: p.battingStyle || "",
            bowlingStyle: p.bowlingStyle && p.bowlingStyle !== "" ? p.bowlingStyle : "none",
            team: team._id,
          });
        }

        playerIds.push(playerDoc._id);
      }

      const captainDoc = await Player.findOne({
        name: { $regex: new RegExp(`^${inputTeam.captain.trim()}$`, "i") },
        team: team._id,
      });
      const wkDoc = await Player.findOne({
        name: { $regex: new RegExp(`^${inputTeam.wicketKeeper.trim()}$`, "i") },
        team: team._id,
      });

      if (!captainDoc || !wkDoc) {
        return NextResponse.json(
          { success: false, message: `Invalid captain or wicket-keeper for ${team.name}` },
          { status: 400 }
        );
      }

      // Update team collection
      team.players = playerIds;
      team.captain = captainDoc._id;
      team.wicketKeeper = wkDoc._id;
      team.ready = playerIds.length === match.totalWickets + 1 && !!captainDoc && !!wkDoc;

      await team.save();
    }

    // If all teams ready, update match status
    const allReady = match.teams.every((t) => t.ready);
    if (allReady && match.status === "upcoming") {
      match.status = "ready-to-start";
      await match.save();
    }

    const updatedMatch = await Match.findById(id).populate("teams");

    return NextResponse.json({
      success: true,
      message: isUpdate ? "Squads updated successfully" : "Squads declared successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to declare/update squads" },
      { status: 500 }
    );
  }
}
