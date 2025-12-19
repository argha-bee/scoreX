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

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";

export async function POST(req, { params }) {
  await connectDB();
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const match = await Match.findById(id);
    if (!match) return new Response("Match not found", { status: 404 });

    // Only scorer can update toss
    if (match.scorer.toString() !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const { tossWinner, decision } = await req.json();

    match.tossWinner = tossWinner;
    match.tossDecision = decision;
    match.status = "ongoing"; // match starts after toss
    await match.save();

    return new Response(JSON.stringify({ message: "Toss updated", match }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
