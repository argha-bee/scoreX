import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Player from "@/models/Player";
import Score from "@/models/Score";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { matchId } = req.query;

    const match = await Match.findById(matchId)
      .populate({
        path: "teams",
        populate: {
          path: "players",
        },
      })
      .populate("scores");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Get all players from both teams
    const allPlayers = [];
    for (const team of match.teams) {
      for (const playerId of team.players) {
        const player = await Player.findById(playerId);
        allPlayers.push(player);
      }
    }

    // Find highest scorer
    const highestScorer = allPlayers.reduce((max, player) => {
      return player.battingStats.runs > (max?.battingStats.runs || 0) ? player : max;
    }, null);

    // Find best bowler
    const bestBowler = allPlayers.reduce((best, player) => {
      if (player.bowlingStats.wickets > (best?.bowlingStats.wickets || 0)) {
        return player;
      }
      if (
        player.bowlingStats.wickets === best?.bowlingStats.wickets &&
        player.bowlingStats.runs < (best?.bowlingStats.runs || Infinity)
      ) {
        return player;
      }
      return best;
    }, null);

    // Calculate match summary
    const totalRuns = match.scores.reduce((sum, score) => sum + score.runs, 0);
    const totalWickets = match.scores.reduce((sum, score) => sum + score.wickets, 0);
    const totalOvers = match.scores.reduce((sum, score) => sum + score.overs + score.balls / 6, 0);

    match.matchSummary = {
      totalRuns,
      totalWickets,
      totalOvers: totalOvers.toFixed(1),
      runRate: (totalRuns / totalOvers).toFixed(2),
      highestScorer: highestScorer
        ? {
            player: highestScorer._id,
            runs: highestScorer.battingStats.runs,
          }
        : null,
      bestBowler: bestBowler
        ? {
            player: bestBowler._id,
            wickets: bestBowler.bowlingStats.wickets,
            runs: bestBowler.bowlingStats.runs,
          }
        : null,
    };

    await match.save();

    res.status(200).json({
      summary: match.matchSummary,
      match,
      highestScorer,
      bestBowler,
    });
  } catch (error) {
    console.error("Error generating match summary:", error);
    res.status(500).json({ message: "Error generating summary", error: error.message });
  }
}
