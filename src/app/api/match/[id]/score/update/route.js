// api/match/[id]/score/update

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import Score from "@/models/Score";
import Match from "@/models/Match";
import Player from "@/models/Player";
import Ball from "@/models/Ball";
import { broadcastScoreUpdate } from "@/lib/websocket";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await connectDB();

    const { scoreId, batsmanOnStrike, bowler } = req.body;

    const score = await Score.findById(scoreId)
      .populate("match")
      .populate("currentBatsmen.player")
      .populate("currentBowler");

    if (!score) {
      return res.status(404).json({ message: "Score not found" });
    }

    const match = await Match.findById(score.match._id);

    if (match.scorer.toString() !== session.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update current batsmen
    if (batsmanOnStrike) {
      const existingBatsman = score.currentBatsmen.find(
        (b) => b.player._id.toString() === batsmanOnStrike
      );

      if (!existingBatsman) {
        // Add new batsman
        score.currentBatsmen.push({
          player: batsmanOnStrike,
          onStrike: true,
        });

        // Set other batsman off strike
        score.currentBatsmen.forEach((b) => {
          if (b.player._id.toString() !== batsmanOnStrike) {
            b.onStrike = false;
          }
        });

        // Update player status
        await Player.findByIdAndUpdate(batsmanOnStrike, { isPlaying: true });
      }
    }

    // Update current bowler
    if (bowler && (!score.currentBowler || score.currentBowler._id.toString() !== bowler)) {
      score.currentBowler = bowler;
      await Player.findByIdAndUpdate(bowler, { isPlaying: true });
    }

    await score.save();

    res.status(200).json({ message: "Score updated", score });
  } catch (error) {
    console.error("Score update error:", error);
    res.status(500).json({ message: "Error updating score", error: error.message });
  }
}
