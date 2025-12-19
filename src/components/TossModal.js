"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "@/styles/TossModal.module.css";

export default function TossModal({ match, onTossComplete, onClose }) {
  const [winnerTeam, setWinnerTeam] = useState("");
  const [choice, setChoice] = useState("bat");
  const [loading, setLoading] = useState(false);

  const startToss = async () => {
    if (!winnerTeam || !choice) {
      Swal.fire("Error", "Please select team and choice", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`/api/match/${match._id}/toss`, {
        winnerTeamId: winnerTeam,
        choice,
      });

      Swal.fire("Success", "Toss completed!", "success");
      onTossComplete(res.data.match); // update parent state
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to start toss", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.title}>Start Toss</h2>

        <label className={styles.label}>
          Select Toss Winner:
          <select
            value={winnerTeam}
            onChange={(e) => setWinnerTeam(e.target.value)}
            className={styles.select}
          >
            <option value="">Select Team</option>
            {match.teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.choiceContainer}>
          <label>
            <input
              type="radio"
              name="choice"
              value="bat"
              checked={choice === "bat"}
              onChange={() => setChoice("bat")}
            />
            Bat
          </label>
          <label>
            <input
              type="radio"
              name="choice"
              value="bowl"
              checked={choice === "bowl"}
              onChange={() => setChoice("bowl")}
            />
            Bowl
          </label>
        </div>

        <button className={styles.startBtn} onClick={startToss} disabled={loading}>
          {loading ? "Starting..." : "Start Toss"}
        </button>
      </div>
    </div>
  );
}
