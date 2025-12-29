"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/Dashboard.module.css";

export default function DashboardContent() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get("/api/match");
        if (res.data.success) setMatches(res.data.matches);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading matches...</p>;
  if (matches.length === 0) return <p style={{ textAlign: "center" }}>No matches available</p>;

  const upcomingStates = ["scheduled", "ready-to-start"];
  const liveStates = ["toss", "in-progress", "innings-break", "1st-innings", "2nd-innings"];
  const finishedStates = ["finished", "abandoned"];

  const categorizedMatches = {
    Upcoming: matches.filter((m) => upcomingStates.includes(m.state)),
    Live: matches.filter((m) => liveStates.includes(m.state)),
    Finished: matches.filter((m) => finishedStates.includes(m.state)),
  };

  const renderMatches = (matchList) =>
    matchList.map((match) => (
      <li
        key={match._id}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "1rem",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = `/dashboard/match/${match._id}`)}
      >
        <p>
          <strong>{match.title}</strong>
        </p>
        <p>
          <strong>Teams:</strong> {match.teams.map((t) => t.shortName).join(" vs ")}
        </p>
        <p>
          <strong>Status:</strong> {match.state.replaceAll("-", " ").toUpperCase()}
        </p>
      </li>
    ));

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h1 style={{ textAlign: "center" }}>Dashboard</h1>

      {["Upcoming", "Live", "Finished"].map((category) => (
        <div key={category} style={{ marginBottom: "2rem" }}>
          <h2 style={{ borderBottom: "2px solid #000", paddingBottom: "0.5rem" }}>{category}</h2>
          {categorizedMatches[category].length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {renderMatches(categorizedMatches[category])}
            </ul>
          ) : (
            <p style={{ textAlign: "center" }}>No {category.toLowerCase()} matches</p>
          )}
        </div>
      ))}
    </div>
  );
}
