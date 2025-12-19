import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { status, limit = 20, page = 1 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate("teams", "name shortName")
      .populate("scorer", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Match.countDocuments(query);

    res.status(200).json({
      matches,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ message: "Error fetching matches", error: error.message });
  }
}
