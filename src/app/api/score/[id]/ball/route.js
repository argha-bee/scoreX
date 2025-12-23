
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Score from "@/models/Score";
// import Match from "@/models/Match";

// export async function POST(req, { params }) {
//   try {
//     await connectDB();
//     const { id } = await params;
//     const { runs, extraType, isWicket } = await req.json();

//     // 1. Fetch Score and Match (Populate match scores to calculate target)
//     const score = await Score.findById(id).populate("currentBatsmen.player");
//     if (!score)
//       return NextResponse.json({ success: false, error: "Score not found" }, { status: 404 });

//     const match = await Match.findById(score.match).populate("scores");
//     if (score.innings === 1) match.state = "in-progress";
//     const striker = score.currentBatsmen?.find((b) => b.onStrike);
//     const nonStriker = score.currentBatsmen?.find((b) => !b.onStrike);

//     if (!score.currentBowler || !striker) {
//       return NextResponse.json({ success: false, error: "Select Bowler/Striker" }, { status: 400 });
//     }

//     let isValidBall = true;

//     // 2. Process Runs & Extras
//     if (extraType === "WD" || extraType === "NB") {
//       score.runs += runs + 1;
//       isValidBall = false;
//     } else {
//       score.runs += runs;
//       score.balls += 1;
//       striker.runs = (striker.runs || 0) + runs;
//       striker.balls = (striker.balls || 0) + 1;
//     }

//     // 3. Handle Wickets
//     if (isWicket) {
//       score.wickets += 1;
//       score.currentBatsmen = score.currentBatsmen.filter((b) => !b.onStrike);
//     }

//     // 4. Bowler Stats Logic
//     if (!score.bowlersPerformance) score.bowlersPerformance = [];
//     let bp = score.bowlersPerformance.find(
//       (b) => b.player && b.player.toString() === score.currentBowler.toString()
//     );

//     if (!bp) {
//       score.bowlersPerformance.push({
//         player: score.currentBowler,
//         runs: 0,
//         wickets: 0,
//         overs: 0,
//         balls: 0,
//       });
//       bp = score.bowlersPerformance[score.bowlersPerformance.length - 1];
//     }
//     bp.runs += extraType === "WD" || extraType === "NB" ? runs + 1 : runs;
//     if (isValidBall) {
//       bp.balls += 1;
//       if (bp.balls === 6) {
//         bp.overs += 1;
//         bp.balls = 0;
//       }
//     }
//     if (isWicket) bp.wickets += 1;

//     // 5. Strike Rotation
//     if (!isWicket && runs % 2 !== 0 && nonStriker) {
//       striker.onStrike = false;
//       nonStriker.onStrike = true;
//     }

//     // 6. Over End Logic
//     let overEnded = false;
//     if (isValidBall && score.balls === 6) {
//       score.overs += 1;
//       score.balls = 0;
//       overEnded = true;
//       if (score.currentBatsmen.length === 2) {
//         score.currentBatsmen.forEach((b) => (b.onStrike = !b.onStrike));
//       }
//     }

//     // 7. TIMELINE & RUN RATE
//     score.scoreEveryBall.push(`${extraType || ""}${runs}${isWicket ? "W" : ""}`);
//     score.calculateRunRate();

//     // 8. MATCH FINISHING LOGIC
//     let inningsFinished = false;
//     let matchFinished = false;

//     const firstInnings = match.scores.find((s) => s.innings === 1);
//     const target = firstInnings ? firstInnings.runs + 1 : null;

//     // Condition A: All out or Overs finished
//     if (score.wickets >= 10 || score.overs >= (match.overs || 20)) {
//       inningsFinished = true;
//       score.isCompleted = true;
//       if (score.innings === 2) matchFinished = true;
//     }

//     // Condition B: Second Innings Target reached
//     if (score.innings === 2 && target && score.runs >= target) {
//       inningsFinished = true;
//       matchFinished = true;
//       score.isCompleted = true;
//     }

//     // 9. UPDATE WINNER & STATUS
//     if (matchFinished) {
//       match.status = "finished";
//       inningsFinished = true;
//       if (score.runs >= target) {
//         match.winner = score.battingTeam; // Chased successfully
//       } else if (score.runs < target - 1) {
//         match.winner = score.bowlingTeam; // Failed to chase
//       } else {
//         match.winner = null; // It's a Tie
//       }
//       await match.save();
//     }

//     await score.save();

//     const updatedScore = await Score.findById(id)
//       .populate("currentBatsmen.player")
//       .populate("currentBowler")
//       .populate("bowlersPerformance.player");

//     return NextResponse.json({
//       success: true,
//       score: updatedScore,
//       overEnded,
//       inningsFinished,
//       matchFinished,
//     });
//   } catch (err) {
//     console.error("API Error:", err);
//     return NextResponse.json({ success: false, error: err.message }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Score from "@/models/Score";
import Match from "@/models/Match";
import Ball from "@/models/Ball";
import Player from "@/models/Player";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { runs, extraType, isWicket } = await req.json();

    const score = await Score.findById(id).populate("currentBatsmen.player");
    if (!score || score.isCompleted) return NextResponse.json({ success: false, error: "Finished" }, { status: 400 });

    const match = await Match.findById(score.match);
    const strikerObj = score.currentBatsmen.find((b) => b.onStrike);
    const nonStrikerObj = score.currentBatsmen.find((b) => !b.onStrike);
    
    if (!strikerObj || !score.currentBowler) {
      return NextResponse.json({ success: false, error: "Select Striker/Bowler" }, { status: 400 });
    }

    const striker = await Player.findById(strikerObj.player._id);
    const bowler = await Player.findById(score.currentBowler);

    

    let isValidBall = true;
    let extraRuns = 0;

    // 1. Process Extras & Runs
    if (extraType === "WD" || extraType === "NB") {
      isValidBall = false;
      extraRuns = runs + 1;
      score.runs += extraRuns;
      if (extraType === "WD") {
        score.extras.wides += extraRuns;
        bowler.bowlingStats.wides += 1;
      } else {
        score.extras.noBalls += extraRuns;
        bowler.bowlingStats.noBalls += 1;
      }
    } else {
      score.runs += runs;
      score.balls += 1;
      strikerObj.runs += runs;
      strikerObj.balls += 1;
      
      // Update Player Stats
      striker.battingStats.runs += runs;
      striker.battingStats.balls += 1;
      if (runs === 4) striker.battingStats.fours += 1;
      if (runs === 6) striker.battingStats.sixes += 1;
    }

    // 2. Handle Wicket
    if (isWicket) {
      score.wickets += 1;
      bowler.bowlingStats.wickets += 1;
      
      // Update Batsman stats
      striker.battingStats.isOut = true;
      striker.battingStats.dismissalType = "bowled"; 
      striker.battingStats.dismissedBy = bowler._id;
      
      score.currentBatsmen = score.currentBatsmen.filter(b => !b.onStrike);
    }

    // 3. Create Ball Document (Record Ball by Ball)
    await Ball.create({
      match: match._id,
      score: score._id,
      innings: score.innings,
      overNumber: score.overs,
      ballNumber: score.balls,
      batsman: striker._id,
      bowler: bowler._id,
      runs: (extraType === "WD" || extraType === "NB") ? 0 : runs,
      extras: { type: extraType || "", runs: extraRuns },
      isWicket,
      isLegalDelivery: isValidBall
    });

    // 4. Update Bowler Local Performance
    let bp = score.bowlersPerformance.find(b => b.player.toString() === bowler._id.toString());
    if (!bp) {
      score.bowlersPerformance.push({ player: bowler._id, runs: 0, wickets: 0, overs: 0, balls: 0 });
      bp = score.bowlersPerformance[score.bowlersPerformance.length - 1];
    }
    bp.runs += (isValidBall ? runs : extraRuns);
    if (isValidBall) {
      bp.balls += 1;
      if (bp.balls === 6) { bp.overs += 1; bp.balls = 0; }
    }
    if (isWicket) bp.wickets += 1;

    // 5. Strike Rotation & Over Logic
    if (!isWicket && (runs === 1 || runs === 3)) {
      strikerObj.onStrike = false;
      if (nonStrikerObj) nonStrikerObj.onStrike = true;
    }

    let overEnded = false;
    if (isValidBall && score.balls === 6) {
      score.overs += 1;
      score.balls = 0;
      overEnded = true;
      score.currentBatsmen.forEach(b => b.onStrike = !b.onStrike);
    }

    // Save all
    score.calculateRunRate();
    striker.calculateStrikeRate();
    bowler.calculateEconomy();
    
    await Promise.all([score.save(), striker.save(), bowler.save()]);

    return NextResponse.json({ success: true, overEnded });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}