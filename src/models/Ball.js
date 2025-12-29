import mongoose from "mongoose";

const BallSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    score: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Score",
      required: true,
    },
    innings: {
      type: Number,
      required: true,
    },
    overNumber: {
      type: Number,
      required: true,
    },
    ballNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    batsman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    bowler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    runs: {
      type: Number,
      default: 0,
      min: 0,
    },
    extras: {
      type: {
        type: String,
        enum: ["", "WD", "NB", "B", "LB"],
        default: "",
      },
      runs: {
        type: Number,
        default: 0,
      },
    },
    isWicket: {
      type: Boolean,
      default: false,
    },
    wicketType: {
      type: String,
      enum: ["", "bowled", "caught", "lbw", "run out", "stumped", "hit wicket"],
      default: "",
    },
    dismissedPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    fielder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    isFour: {
      type: Boolean,
      default: false,
    },
    isSix: {
      type: Boolean,
      default: false,
    },
    isLegalDelivery: {
      type: Boolean,
      default: true,
    },
    commentary: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

BallSchema.index({ match: 1, innings: 1, overNumber: 1, ballNumber: 1 });

export default mongoose.models.Ball || mongoose.model("Ball", BallSchema);
