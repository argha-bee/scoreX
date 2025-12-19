import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import User from "@/models/User";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const match = await Match.findById(id)
      .populate("teams", "name shortName players captain wicketKeeper")
      .populate("scorer", "username")
      .lean({ virtuals: true });

    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, match });
  } catch (err) {
    console.error("GET /api/match/[id] error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch match" }, { status: 500 });
  }
}
