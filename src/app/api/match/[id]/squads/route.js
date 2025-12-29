import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function POST(req, { params }) {
  return handleSquads(req, params, false);
}

export async function PUT(req, { params }) {
  return handleSquads(req, params, true);
}

async function handleSquads(req, params, isUpdate) {
  try {
    await connectDB();
    const { id } = await params;
    const { teams: inputTeams } = await req.json();

    if (!Array.isArray(inputTeams)) {
      return NextResponse.json(
        { success: false, message: "Invalid teams payload" },
        { status: 400 }
      );
    }

    const match = await Match.findById(id).populate("teams");
    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    if (!isUpdate && match.state !== "scheduled") {
      return NextResponse.json(
        { success: false, message: "Squads locked after toss" },
        { status: 400 }
      );
    }

    for (const inputTeam of inputTeams) {
      const team = match.teams.find((t) => t._id.toString() === inputTeam._id);
      if (!team) continue;

      const playerIds = [];

      for (const p of inputTeam.players) {
        if (!p.name || !p.jerseyNumber || !p.role) continue;

        let player = await Player.findOne({
          team: team._id,
          jerseyNumber: p.jerseyNumber,
        });

        if (!player) {
          player = await Player.create({
            name: p.name.trim(),
            jerseyNumber: p.jerseyNumber,
            role: p.role,
            battingStyle: p.battingStyle || "right-hand",
            bowlingStyle: p.bowlingStyle || "none",
            team: team._id,
            match: match._id,
          });
        } else {
          player.name = p.name.trim();
          player.role = p.role;
          player.battingStyle = p.battingStyle || player.battingStyle;
          player.bowlingStyle = p.bowlingStyle || player.bowlingStyle;
          await player.save();
        }

        playerIds.push(player._id);
      }

      const captain = await Player.findOne({
        team: team._id,
        name: inputTeam.captain,
      });

      const wicketKeeper = await Player.findOne({
        team: team._id,
        name: inputTeam.wicketKeeper,
      });

      if (!captain || !wicketKeeper) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid captain or wicket-keeper for ${team.name}`,
          },
          { status: 400 }
        );
      }

      team.players = playerIds;
      team.captain = captain._id;
      team.wicketKeeper = wicketKeeper._id;
      team.ready = playerIds.length === match.totalWickets + 1;

      await team.save();
    }

    const allReady = match.teams.every((t) => t.ready);
    if (allReady && match.state === "scheduled") {
      match.state = "ready-to-start";
      await match.save();
    }

    const updatedMatch = await Match.findById(id).populate({
      path: "teams",
      populate: {
        path: "players captain wicketKeeper",
      },
    });

    return NextResponse.json({
      success: true,
      message: isUpdate ? "Squads updated successfully" : "Squads declared successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Squads route error:", error);
    return NextResponse.json({ success: false, message: "Failed to save squads" }, { status: 500 });
  }
}
