// app/api/match/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";

// GET /api/match/[id]
export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const match = await Match.findById(id)
      .populate({
        path: "teams",
        populate: {
          path: "players captain wicketKeeper",
        },
      })
      .populate("battingTeam bowlingTeam")
      .populate("scores")
      .populate("scorer", "name email");

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { message: "Error fetching match", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/match/[id]
export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const match = await Match.findById(id);

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    if (match.scorer.toString() !== session.user.id) {
      return NextResponse.json({ message: "Not authorized to update this match" }, { status: 403 });
    }

    const updates = await req.json();
    Object.keys(updates).forEach((key) => {
      match[key] = updates[key];
    });

    await match.save();

    return NextResponse.json({ message: "Match updated successfully", match });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { message: "Error updating match", error: error.message },
      { status: 500 }
    );
  }
}
