"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "@/styles/Dashboard.module.css";

export default function TossPage() {
  const router = useRouter();
  const { id } = useParams(); // match id
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState(""); // bat or bowl

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(`/api/match/${id}`);
        setMatch(res.data.match);
      } catch (error) {
        Swal.fire("Error", "Unable to load match", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  const handleTossSubmit = async () => {
    if (!tossWinner || !decision) {
      Swal.fire("Error", "Please select both toss winner and decision", "error");
      return;
    }

    try {
      await axios.post(`/api/match/${id}/toss`, {
        tossWinner,
        decision,
      });

      Swal.fire("Success", "Toss recorded successfully", "success");
      router.push(`/dashboard/match/${id}`);
    } catch (error) {
      Swal.fire("Error", "Failed to update toss", "error");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading match...</p>;
  if (!match) return <p style={{ textAlign: "center" }}>Match not found</p>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h1>Start Toss</h1>
      <p>
        <strong>Match:</strong> {match.teams.map((t) => t.shortName).join(" vs ")}
      </p>

      <div style={{ margin: "1rem 0" }}>
        <label>
          Toss Winner:
          <select
            value={tossWinner}
            onChange={(e) => setTossWinner(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">Select Team</option>
            {match.teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ margin: "1rem 0" }}>
        <label>
          Decision:
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="">Select Decision</option>
            <option value="bat">Bat First</option>
            <option value="bowl">Bowl First</option>
          </select>
        </label>
      </div>

      <button onClick={handleTossSubmit} style={{ marginTop: "1rem" }}>
        Submit Toss
      </button>
    </div>
  );
}
