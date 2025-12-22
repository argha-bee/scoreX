import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Player name is required."],
      trim: true,
    },
    jerseyNumber: {
      type: Number,
      required: [true, "Player kit number is required."],
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    role: {
      type: String,
      enum: ["batsman", "bowler", "all-rounder", "wicket-keeper"],
      required: true,
    },

    battingStyle: {
      type: String,
      enum: ["right-hand", "left-hand"],
    },

    bowlingStyle: {
      type: String,
      enum: ["right-arm", "left-arm", "none"],
      default: "none",
    },
    battingStats: {
      runs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
      fours: { type: Number, default: 0 },
      sixes: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      isOut: { type: Boolean, default: false },
      dismissalType: {
        type: String,
        enum: [
          "",
          "bowled",
          "caught",
          "lbw",
          "run out",
          "stumped",
          "hit wicket",
          "retired hurt",
          "not out",
        ],
        default: "",
      },
      dismissedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
      caughtBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    },
    bowlingStats: {
      overs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
      maidens: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      economy: { type: Number, default: 0 },
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    isCaptain: {
      type: Boolean,
      default: false,
    },
    isWicketKeeper: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 UNIQUE constraint
PlayerSchema.index(
  { name: 1, jerseyNumber: 1, team: 1 },
  { unique: true }
);

// Calculate strike rate
PlayerSchema.methods.calculateStrikeRate = function () {
  if (this.battingStats.balls > 0) {
    this.battingStats.strikeRate = (
      (this.battingStats.runs / this.battingStats.balls) *
      100
    ).toFixed(2);
  }
};

// Calculate economy rate
PlayerSchema.methods.calculateEconomy = function () {
  if (this.bowlingStats.overs > 0) {
    this.bowlingStats.economy = (this.bowlingStats.runs / this.bowlingStats.overs).toFixed(2);
  }
};

export default mongoose.models.Player || mongoose.model("Player", PlayerSchema);
