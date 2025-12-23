// // import mongoose from "mongoose";

// // const ScoreSchema = new mongoose.Schema(
// //   {
// //     match: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Match",
// //       required: true,
// //     },
// //     innings: {
// //       type: Number,
// //       required: true,
// //       min: 1,
// //       max: 2,
// //     },
// //     battingTeam: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Team",
// //       required: true,
// //     },
// //     bowlingTeam: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Team",
// //       required: true,
// //     },
// //     runs: {
// //       type: Number,
// //       default: 0,
// //     },
// //     wickets: {
// //       type: Number,
// //       default: 0,
// //     },
// //     overs: {
// //       type: Number,
// //       default: 0,
// //     },
// //     balls: {
// //       type: Number,
// //       default: 0,
// //     },
// //     extras: {
// //       wides: { type: Number, default: 0 },
// //       noBalls: { type: Number, default: 0 },
// //       byes: { type: Number, default: 0 },
// //       legByes: { type: Number, default: 0 },
// //       total: { type: Number, default: 0 },
// //     },
// //     currentBatsmen: [
// //       {
// //         player: {
// //           type: mongoose.Schema.Types.ObjectId,
// //           ref: "Player",
// //         },
// //         onStrike: {
// //           type: Boolean,
// //           default: false,
// //         },
// //       },
// //     ],
// //     currentBowler: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Player",
// //     },
// //     currentOver: {
// //       overNumber: { type: Number, default: 0 },
// //       balls: [
// //         {
// //           type: mongoose.Schema.Types.ObjectId,
// //           ref: "Ball",
// //         },
// //       ],
// //     },
// //     runRate: {
// //       type: Number,
// //       default: 0,
// //     },
// //     requiredRunRate: Number,
// //     partnerships: [
// //       {
// //         batsman1: {
// //           type: mongoose.Schema.Types.ObjectId,
// //           ref: "Player",
// //         },
// //         batsman2: {
// //           type: mongoose.Schema.Types.ObjectId,
// //           ref: "Player",
// //         },
// //         runs: Number,
// //         balls: Number,
// //       },
// //     ],
// //     fallOfWickets: [
// //       {
// //         player: {
// //           type: mongoose.Schema.Types.ObjectId,
// //           ref: "Player",
// //         },
// //         runs: Number,
// //         overs: Number,
// //         balls: Number,
// //       },
// //     ],
// //     isCompleted: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     totalScore: {
// //       type: Number,
// //       default: 0,
// //     },
// //     wicketsDown: {
// //       type: Number,
// //       default: 0,
// //     },
// //     scoreEveryBall: [{ type: String, default: "" }],
// //     scoreEveryOver: [
// //       {
// //         overRuns: Number,
// //         overWicks: Number,
// //       },
// //     ],
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // // Calculate run rate
// // ScoreSchema.methods.calculateRunRate = () => {
// //   const totalBalls = this.overs * 6 + this.balls;
// //   if (totalBalls > 0) {
// //     const totalOvers = totalBalls / 6;
// //     this.runRate = (this.runs / totalOvers).toFixed(2);
// //   }
// // };

// // export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);

// import mongoose from "mongoose";

// const ScoreSchema = new mongoose.Schema(
//   {
//     match: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
//     innings: { type: Number, required: true, min: 1, max: 2 },
//     battingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
//     bowlingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
//     runs: { type: Number, default: 0 },
//     wickets: { type: Number, default: 0 },
//     overs: { type: Number, default: 0 },
//     balls: { type: Number, default: 0 },
//     extras: {
//       wides: { type: Number, default: 0 },
//       noBalls: { type: Number, default: 0 },
//       byes: { type: Number, default: 0 },
//       legByes: { type: Number, default: 0 },
//       total: { type: Number, default: 0 },
//     },
//     currentBatsmen: [
//       {
//         player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
//         onStrike: { type: Boolean, default: false },
//         runs: { type: Number, default: 0 },
//         balls: { type: Number, default: 0 },
//       },
//     ],
//     currentBowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
//     bowlersPerformance: [
//       {
//         player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
//         runs: { type: Number, default: 0 },
//         wickets: { type: Number, default: 0 },
//         overs: { type: Number, default: 0 },
//         balls: { type: Number, default: 0 },
//       },
//     ],
//     runRate: { type: Number, default: 0 },
//     scoreEveryBall: [{ type: String, default: [] }],
//     isCompleted: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// // CRITICAL FIX: Use regular function syntax
// ScoreSchema.methods.calculateRunRate = function () {
//   const totalBalls = (this.overs || 0) * 6 + (this.balls || 0);
//   if (totalBalls > 0) {
//     this.runRate = parseFloat((this.runs / (totalBalls / 6)).toFixed(2));
//   } else {
//     this.runRate = 0;
//   }
//   return this.runRate;
// };

// export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);

import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
    innings: { type: Number, required: true, min: 1, max: 2 },
    battingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    bowlingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    extras: {
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legByes: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    currentBatsmen: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        onStrike: { type: Boolean, default: false },
        runs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
      },
    ],
    currentBowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    bowlersPerformance: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        overs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
      },
    ],
    runRate: { type: Number, default: 0 },
    target: { type: Number, default: 0 },
    scoreEveryBall: [{ type: String }],
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Define method BEFORE compiling model
ScoreSchema.methods.calculateRunRate = function () {
  const totalBalls = (this.overs || 0) * 6 + (this.balls || 0);
  if (totalBalls > 0) {
    this.runRate = parseFloat((this.runs / (totalBalls / 6)).toFixed(2));
  } else {
    this.runRate = 0;
  }
  return this.runRate;
};

// Clear model cache to prevent stale methods during development
if (mongoose.models.Score) {
  delete mongoose.models.Score;
}

export default mongoose.model("Score", ScoreSchema);
