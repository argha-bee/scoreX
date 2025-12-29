import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Score from "@/models/Score";
import Player from "@/models/Player";
import Team from "@/models/Team";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Match ID is missing" }, { status: 400 });
    }

    let match = await Match.findById(id);

    if (!match) {
      return NextResponse.json({ success: false, error: "Match Not Found!" }, { status: 404 });
    }

    if (!match.scores || match.scores.length === 0) {
      if (!match.toss || !match.toss.winnerTeam) {
        return NextResponse.json(
          { success: false, error: "Toss data not updated yet" },
          { status: 400 }
        );
      }

      const isWinnerBatting = match.toss.choice === "bat";
      const battingTeamId = isWinnerBatting
        ? match.toss.winnerTeam
        : match.teams.find((t) => t.toString() !== match.toss.winnerTeam.toString());
      const bowlingTeamId = match.teams.find((t) => t.toString() !== battingTeamId.toString());

      const firstInnings = await Score.create({
        match: match._id,
        innings: 1,
        battingTeam: battingTeamId,
        bowlingTeam: bowlingTeamId,
        currentBatsmen: [],
        runs: 0,
        wickets: 0,
        balls: 0,
        overs: 0,
        scoreEveryBall: [],
      });

      match.scores.push(firstInnings._id);
      match.state = "1st-innings";
      match.currentInnings = 1;
      await match.save();
    }

    const populatedMatch = await Match.findById(id)
      .populate({
        path: "teams",
        model: Team,
        select: "name shortName players",
        populate: {
          path: "players",
          model: Player,
          select: "name jerseyNumber role battingStyle bowlingStyle battingStats bowlingStats team",
        },
      })
      .populate({
        path: "scores",
        model: Score,
        populate: [
          {
            path: "currentBatsmen.player",
            model: Player,
            select: "name jerseyNumber battingStats",
          },
          {
            path: "currentBowler",
            model: Player,
            select: "name jerseyNumber bowlingStats",
          },
          {
            path: "bowlersPerformance.player",
            model: Player,
            select: "name jerseyNumber bowlingStats",
          },
          { path: "battingTeam", model: Team, select: "name shortName" },
          { path: "bowlingTeam", model: Team, select: "name shortName" },
        ],
      })
      .populate("scorer", "username");

    const allPlayers = [...populatedMatch.teams[0].players, ...populatedMatch.teams[1].players];

    return NextResponse.json({ success: true, data: populatedMatch, allPlayers }, { status: 200 });
  } catch (err) {
    console.error("BACKEND ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
