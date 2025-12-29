import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Score from "@/models/Score";
import Player from "@/models/Player";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { playerId, onStrike } = await req.json();

    const score = await Score.findById(id);
    if (!score)
      return NextResponse.json({ success: false, message: "Score not found" }, { status: 404 });

    if (onStrike) {
      score.currentBatsmen.forEach((b) => {
        b.onStrike = false;
      });
    }

    const alreadyIn = score.currentBatsmen.find((b) => b.player.toString() === playerId);

    if (alreadyIn) {
      alreadyIn.onStrike = onStrike;
    } else {
      score.currentBatsmen.push({
        player: playerId,
        onStrike: onStrike,
        runs: 0,
        balls: 0,
      });
    }

    if (score.currentBatsmen.length > 2) {
      return NextResponse.json(
        { success: false, message: "Already 2 batsmen on field" },
        { status: 400 }
      );
    }

    await score.save();

    const updatedScore = await Score.findById(id)
      .populate("currentBatsmen.player")
      .populate("currentBowler");

    return NextResponse.json({ success: true, score: updatedScore });
  } catch (error) {
    console.error("Add Batsman Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
