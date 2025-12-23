// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]";
// import connectDB from "@/lib/mongodb";
// import Match from "@/models/Match";
// import Score from "@/models/Score";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const session = await getServerSession(req, res, authOptions);

//     if (!session) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     await connectDB();

//     const { matchId, tossWinner, tossDecision } = req.body;

//     const match = await Match.findById(matchId).populate("teams");

//     if (!match) {
//       return res.status(404).json({ message: "Match not found" });
//     }

//     if (match.scorer.toString() !== session.user.id) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     // Update match with toss details
//     match.tossWinner = tossWinner;
//     match.tossDecision = tossDecision;
//     match.status = "in-progress";

//     // Set batting and bowling teams based on toss decision
//     const winnerTeam = match.teams.find((t) => t._id.toString() === tossWinner);
//     const loserTeam = match.teams.find((t) => t._id.toString() !== tossWinner);

//     if (tossDecision === "bat") {
//       match.battingTeam = winnerTeam._id;
//       match.bowlingTeam = loserTeam._id;
//     } else {
//       match.battingTeam = loserTeam._id;
//       match.bowlingTeam = winnerTeam._id;
//     }

//     await match.save();

//     // Create first innings score
//     const score = await Score.create({
//       match: match._id,
//       innings: 1,
//       battingTeam: match.battingTeam,
//       bowlingTeam: match.bowlingTeam,
//     });

//     match.scores.push(score._id);
//     await match.save();

//     res.status(200).json({ message: "Toss completed", match, score });
//   } catch (error) {
//     console.error("Toss error:", error);
//     res.status(500).json({ message: "Error completing toss", error: error.message });
//   }
// }
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Score from "@/models/Score";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { tossWinner, decision } = await req.json();

    const match = await Match.findById(id);
    if (!match)
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });

    match.tossWinner = tossWinner;
    match.tossDecision = decision;
    match.toss = { winnerTeam: tossWinner, choice: decision };
    match.state = "toss";

    const winnerId = tossWinner.toString();

    // Identify the loser correctly using .equals()
    const tossLoser = match.teams[0].equals(winnerId) ? match.teams[1] : match.teams[0];
    // const tossLoser = match.teams[0] === tossWinner ? match.teams[1] : match.teams[0];

    await match.save();

    // set batting and bowling teams at the beginning of the match
    const matchScore = await Score.findOne({ match: id, innings: 1 });
    if (matchScore) {
      matchScore.battingTeam = decision === "bat" ? tossWinner : tossLoser;
      matchScore.bowlingTeam = decision === "bat" ? tossLoser : tossWinner;
      await matchScore.save();
    }

    return NextResponse.json({ success: true, message: "Toss recorded" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to record toss" }, { status: 500 });
  }
}
