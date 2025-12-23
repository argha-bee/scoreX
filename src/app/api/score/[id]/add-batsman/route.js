import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Score from "@/models/Score";
import Player from "@/models/Player"; // Import to register schema

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { playerId, onStrike } = await req.json();

    const score = await Score.findById(id);
    if (!score)
      return NextResponse.json({ success: false, message: "Score not found" }, { status: 404 });

    // 1. Logic: If the newcomer is taking strike, set everyone else to off-strike
    if (onStrike) {
      score.currentBatsmen.forEach((b) => {
        b.onStrike = false;
      });
    }

    // 2. Logic: Check if player is already in the field (to prevent duplicates)
    const alreadyIn = score.currentBatsmen.find((b) => b.player.toString() === playerId);

    if (alreadyIn) {
      // Just update strike status if they are already there
      alreadyIn.onStrike = onStrike;
    } else {
      // Add new batsman entry
      score.currentBatsmen.push({
        player: playerId,
        onStrike: onStrike,
        runs: 0,
        balls: 0,
      });
    }

    // 3. Limit to 2 batsmen on field at once
    if (score.currentBatsmen.length > 2) {
      return NextResponse.json(
        { success: false, message: "Already 2 batsmen on field" },
        { status: 400 }
      );
    }

    await score.save();

    // 4. Re-populate everything for the frontend
    const updatedScore = await Score.findById(id)
      .populate("currentBatsmen.player")
      .populate("currentBowler");

    return NextResponse.json({ success: true, score: updatedScore });
  } catch (error) {
    console.error("Add Batsman Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
