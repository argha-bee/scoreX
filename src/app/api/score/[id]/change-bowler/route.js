import { NextResponse } from "next/server"; // 🔥 THIS WAS MISSING
import connectDB from "@/lib/mongodb";
import Score from "@/models/Score";
import Player from "@/models/Player"; // Import to ensure schema registration

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Score ID
    const { playerId } = await req.json();

    if (!playerId) {
      return NextResponse.json({ success: false, message: "No Player ID" }, { status: 400 });
    }

    // Update the current bowler and immediately populate it
    const score = await Score.findByIdAndUpdate(id, { currentBowler: playerId }, { new: true })
      .populate("currentBatsmen.player")
      .populate("currentBowler");

    if (!score) {
      return NextResponse.json({ success: false, message: "Score not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error("Change Bowler Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
