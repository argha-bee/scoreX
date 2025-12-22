// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Match from "@/models/Match";
// import Team from "@/models/Team";

// export async function GET(req, { params }) {
//   try {
//     await connectDB();

//     // Extract ID from the URL path
//     const { id } = await params;
//     console.log("ID FOUND = ", id);

//     if (!id) {
//       return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
//     }

//     const match = await Match.findById(id)
//       .populate("teams", "name shortName players captain wicketKeeper")
//       .populate("scorer", "username");

//     if (!match)
//       return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });

//     return NextResponse.json({ success: true, match });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ success: false, message: "Failed to fetch match" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Player from "@/models/Player"; // 🔥 MUST IMPORT

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    console.log("ID FOUND =", id);

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    // Match fetch with nested players populate
    const match = await Match.findById(id)
      .populate({
        path: "teams",
        select: "name shortName players", // শুধু players
        populate: {
          path: "players",
          model: "Player", // must specify
          select: "name jerseyNumber role battingStyle bowlingStyle",
        },
      })
      .populate("scorer", "username"); // scorer optional

    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error("MATCH FETCH ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch match" }, { status: 500 });
  }
}
