// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Match from "@/models/Match";
// // import Team from "@/models/Team";
// import Player from "@/models/Player";

// export async function POST(req, { params }) {
//   // POST = Declare squads
//   return handleSquad(req, params);
// }

// export async function PUT(req, { params }) {
//   // PUT = Update squads
//   return handleSquad(req, params, true);
// }

// // Common function for both declare & update
// async function handleSquad(req, params, isUpdate = false) {
//   try {
//     await connectDB();
//     const { id } = await params;
//     const { teams: inputTeams } = await req.json();

//     if (!inputTeams) {
//       return NextResponse.json({ success: false, message: "Teams data missing" }, { status: 400 });
//     }

//     const match = await Match.findById(id).populate("teams");
//     if (!match) {
//       return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
//     }

//     for (let i = 0; i < match.teams.length; i++) {
//       const team = match.teams[i];
//       const inputTeam = inputTeams[i];
//       if (!inputTeam) continue;

//       const playerIds = [];

//       for (const p of inputTeam.players) {
//         const normalizedName = p.name.trim().toLowerCase();

//         let playerDoc = await Player.findOne({
//           name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
//           jerseyNumber: p.jerseyNumber,
//           team: team._id,
//         });

//         if (!playerDoc) {
//           playerDoc = await Player.create({
//             name: p.name.trim(),
//             jerseyNumber: p.jerseyNumber,
//             role: p.role,
//             battingStyle: p.battingStyle || "",
//             bowlingStyle: p.bowlingStyle && p.bowlingStyle !== "" ? p.bowlingStyle : "none",
//             team: team._id,
//           });
//         }

//         playerIds.push(playerDoc._id);
//       }

//       const captainDoc = await Player.findOne({
//         name: { $regex: new RegExp(`^${inputTeam.captain.trim()}$`, "i") },
//         team: team._id,
//       });
//       const wkDoc = await Player.findOne({
//         name: { $regex: new RegExp(`^${inputTeam.wicketKeeper.trim()}$`, "i") },
//         team: team._id,
//       });

//       if (!captainDoc || !wkDoc) {
//         return NextResponse.json(
//           { success: false, message: `Invalid captain or wicket-keeper for ${team.name}` },
//           { status: 400 }
//         );
//       }

//       // Update team collection
//       team.players = playerIds;
//       team.captain = captainDoc._id;
//       team.wicketKeeper = wkDoc._id;
//       team.ready = playerIds.length === match.totalWickets + 1 && !!captainDoc && !!wkDoc;

//       await team.save();
//     }

//     // If all teams ready, update match status
//     const allReady = match.teams.every((t) => t.ready);
//     if (allReady && match.status === "upcoming") {
//       match.status = "ready-to-start";
//       await match.save();
//     }

//     const updatedMatch = await Match.findById(id).populate("teams");

//     return NextResponse.json({
//       success: true,
//       message: isUpdate ? "Squads updated successfully" : "Squads declared successfully",
//       match: updatedMatch,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { success: false, message: "Failed to declare/update squads" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function POST(req, { params }) {
  // Declare squads
  return handleSquads(req, params, false);
}

export async function PUT(req, { params }) {
  // Update squads
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

    // 🔒 Lock after toss
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
        // ⛔ Skip empty slots
        if (!p.name || !p.jerseyNumber || !p.role) continue;

        // ✅ Reuse player by (team + jersey)
        let player = await Player.findOne({
          team: team._id,
          jerseyNumber: p.jerseyNumber,
        });

        if (!player) {
          // ➕ Create new player
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
          // 🔁 Update existing (preserve _id + stats)
          player.name = p.name.trim();
          player.role = p.role;
          player.battingStyle = p.battingStyle || player.battingStyle;
          player.bowlingStyle = p.bowlingStyle || player.bowlingStyle;
          await player.save();
        }

        playerIds.push(player._id);
      }

      // 🧢 Captain & WK must belong to squad
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

      // ✅ Update team
      team.players = playerIds;
      team.captain = captain._id;
      team.wicketKeeper = wicketKeeper._id;
      team.ready = playerIds.length === match.totalWickets + 1;

      await team.save();
    }

    // 🚦 If both teams ready → move match state
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
