"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "@/styles/Dashboard.module.css";

export default function MatchInfoPage({ matchId }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Squad modal state
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [team1Captain, setTeam1Captain] = useState("");
  const [team2Captain, setTeam2Captain] = useState("");
  const [team1WK, setTeam1WK] = useState("");
  const [team2WK, setTeam2WK] = useState("");

  // Toss modal state
  const [showTossModal, setShowTossModal] = useState(false);
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(`/api/match/${matchId}`);
        if (!res.data.success) throw new Error(res.data.message);

        setMatch(res.data.match);

        // Initialize players if already saved
        if (res.data.match.teams?.length === 2) {
          setTeam1Players(res.data.match.teams[0].players || []);
          setTeam2Players(res.data.match.teams[1].players || []);
          setTeam1Captain(res.data.match.teams[0].captain?._id || "");
          setTeam2Captain(res.data.match.teams[1].captain?._id || "");
          setTeam1WK(res.data.match.teams[0].wicketKeeper?._id || "");
          setTeam2WK(res.data.match.teams[1].wicketKeeper?._id || "");
        }
      } catch (err) {
        Swal.fire("Error", err.message || "Failed to load match", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId]);

  const canToss = match?.teams?.every((t) => t.players?.length > 0 && t.captain && t.wicketKeeper);

  if (loading) return <p style={{ textAlign: "center" }}>Loading match...</p>;
  if (!match) return <p style={{ textAlign: "center" }}>Match not found</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f9fafb",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "2rem",
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#4f46e5" }}>Match Info</h1>

        <p>
          <strong>Teams:</strong> {match.teams.map((t) => t.shortName).join(" vs ")}
        </p>
        <p>
          <strong>Status:</strong> {match.status.toUpperCase()}
        </p>

        {/* Buttons */}
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <button onClick={() => setShowSquadModal(true)} style={buttonStyle}>
            Declare Squad
          </button>

          <button
            onClick={() => setShowTossModal(true)}
            disabled={!canToss || match.status !== "upcoming"}
            style={{
              ...buttonStyle,
              backgroundColor: canToss && match.status === "upcoming" ? "#4f46e5" : "#ccc",
              cursor: canToss && match.status === "upcoming" ? "pointer" : "not-allowed",
            }}
          >
            Start Toss
          </button>

          {match.tossDecision && (
            <button
              onClick={() => (window.location.href = `/dashboard/match/${matchId}/score`)}
              style={buttonStyle}
            >
              Continue Scoring
            </button>
          )}
        </div>

        {/* Squad and Toss modals remain the same */}
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "0.6rem 1.2rem",
  backgroundColor: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
