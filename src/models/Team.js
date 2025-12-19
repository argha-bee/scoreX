import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    wicketKeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    battingOrder: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
