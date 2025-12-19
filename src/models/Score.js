import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    innings: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    battingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    bowlingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    runs: {
      type: Number,
      default: 0,
    },
    wickets: {
      type: Number,
      default: 0,
    },
    overs: {
      type: Number,
      default: 0,
    },
    balls: {
      type: Number,
      default: 0,
    },
    extras: {
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legByes: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    currentBatsmen: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
        },
        onStrike: {
          type: Boolean,
          default: false,
        },
      },
    ],
    currentBowler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    currentOver: {
      overNumber: { type: Number, default: 0 },
      balls: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ball",
        },
      ],
    },
    runRate: {
      type: Number,
      default: 0,
    },
    requiredRunRate: Number,
    partnerships: [
      {
        batsman1: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
        },
        batsman2: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
        },
        runs: Number,
        balls: Number,
      },
    ],
    fallOfWickets: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
        },
        runs: Number,
        overs: Number,
        balls: Number,
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate run rate
ScoreSchema.methods.calculateRunRate = () => {
  const totalBalls = this.overs * 6 + this.balls;
  if (totalBalls > 0) {
    const totalOvers = totalBalls / 6;
    this.runRate = (this.runs / totalOvers).toFixed(2);
  }
};

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);
