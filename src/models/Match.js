import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    title: String,

    format: {
      type: String,
      enum: ["Test", "ODI", "T20", "Custom"],
      required: true,
    },

    overs: Number,

    totalWickets: {
      type: Number,
      default: 10,
    },

    venue: String,

    date: {
      type: Date,
      default: Date.now,
    },

    state: {
      type: String,
      enum: [
        "scheduled",
        "toss",
        "live",
        "in-progress",
        "1st-innings",
        "2nd-innings",
        "innings-break",
        "finished",
        "abandoned",
        "ready-to-start",
      ],
      default: "scheduled",
    },

    tossWinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    tossDecision: {
      type: String,
      enum: ["bat", "bowl"],
    },

    toss: {
      winnerTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      choice: { type: String, enum: ["bat", "bowl"] },
    },

    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],

    battingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    bowlingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    currentInnings: {
      type: Number,
      default: 1,
    },

    scorer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Score" }],

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    winningMargin: String,

    matchSummary: Object,
  },
  { timestamps: true }
);

/**
 * VIRTUAL PUBLIC STATUS
 * Computes match status from internal state
 */
MatchSchema.virtual("status").get(function () {
  if (this.state === "completed" || this.state === "abandoned") return "completed";
  if (this.state === "in-progress" || this.state === "innings-break") return "ongoing";
  return "upcoming";
});

// Allow virtuals in JSON
MatchSchema.set("toJSON", { virtuals: true });
MatchSchema.set("toObject", { virtuals: true });

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
