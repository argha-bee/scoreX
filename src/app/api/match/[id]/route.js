import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // Extract ID from the URL path
    const { id } = await params;
    console.log("ID FOUND = ", id);

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const match = await Match.findById(id)
      .populate("teams", "name shortName players captain wicketKeeper")
      .populate("scorer", "username");

    if (!match)
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch match" }, { status: 500 });
  }
}
