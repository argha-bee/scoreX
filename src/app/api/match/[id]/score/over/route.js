// api/match/[id]/score/over

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

    const { scoreId, newBowlerId } = req.body;

    const score = await Score.findById(scoreId).populate("match");

    if (!score) {
      return res.status(404).json({ message: "Score not found" });
    }

    const match = await Match.findById(score.match._id);

    if (match.scorer.toString() !== session.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Set previous bowler to not playing
    if (score.currentBowler) {
      await Player.findByIdAndUpdate(score.currentBowler, { isPlaying: false });
    }

    // Set new bowler
    score.currentBowler = newBowlerId;
    await Player.findByIdAndUpdate(newBowlerId, { isPlaying: true });

    // Change strike between batsmen
    score.currentBatsmen.forEach((b) => {
      b.onStrike = !b.onStrike;
    });

    await score.save();

    res.status(200).json({ message: "Over completed, new bowler set", score });
  } catch (error) {
    console.error("Over completion error:", error);
    res.status(500).json({ message: "Error completing over", error: error.message });
  }
}
