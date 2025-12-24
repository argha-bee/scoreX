"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/Dashboard.module.css";

export default function Dashboard() {
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

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h1 style={{ textAlign: "center" }}>Dashboard</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {matches.map((match) => (
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
              <strong> {match.title}</strong>
            </p>
            <p>
              <strong>Teams:</strong> {match.teams.map((t) => t.shortName).join(" vs ")}
            </p>
            <p>
              <strong>Status:</strong> {match.state.toUpperCase()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";
// import DashboardClient from "./DashboardClient";

// export default async function DashboardPage() {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     // redirect("/auth/login");
//   }

//   return <DashboardClient />;
// }
