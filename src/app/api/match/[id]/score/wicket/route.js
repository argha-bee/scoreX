// api/match/[id]/score/wicket
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import Score from "@/models/Score";
import Match from "@/models/Match";
import Player from "@/models/Player";

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

    const { scoreId, newBatsmanId } = req.body;

    const score = await Score.findById(scoreId).populate("match");

    if (!score) {
      return res.status(404).json({ message: "Score not found" });
    }

    const match = await Match.findById(score.match._id);

    if (match.scorer.toString() !== session.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add new batsman
    score.currentBatsmen.push({
      player: newBatsmanId,
      onStrike: true,
    });

    // Set other batsman off strike
    score.currentBatsmen.forEach((b) => {
      if (b.player._id.toString() !== newBatsmanId) {
        b.onStrike = false;
      }
    });

    await Player.findByIdAndUpdate(newBatsmanId, { isPlaying: true });

    await score.save();

    res.status(200).json({ message: "New batsman added", score });
  } catch (error) {
    console.error("Wicket handling error:", error);
    res.status(500).json({ message: "Error handling wicket", error: error.message });
  }
}
