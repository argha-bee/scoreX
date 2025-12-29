import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid match ID" }, { status: 400 });
    }

    const match = await Match.findById(id)
      .populate({
        path: "teams",
        select: "name shortName players",
        populate: {
          path: "players",
          model: "Player",
          select: "name jerseyNumber role battingStyle bowlingStyle",
        },
      })
      .populate("scorer", "username");

    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error("MATCH FETCH ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch match" }, { status: 500 });
  }
}
