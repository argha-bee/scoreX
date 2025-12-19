"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";

export default function MatchInfoClient({ matchId }) {
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(`/api/match/${matchId}`);
        setMatch(res.data.match);
      } catch (err) {
        Swal.fire("Error", "Failed to load match", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) return <p>Loading match info...</p>;
  if (!match) return <p>Match not found</p>;

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h1>{match.title}</h1>
      <p>Status: {match.status}</p>
      {/* Buttons/modals for squad/toss/score update */}
    </div>
  );
}
