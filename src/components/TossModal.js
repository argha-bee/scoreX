"use client";

import { useState } from "react";
import styles from "@/styles/Dashboard.module.css";

export default function TossModal({ match, onClose, onSubmit }) {
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");


  const handleSubmit = () => {
    if (!tossWinner || !decision) {
      alert("Select toss winner and decision");
      return;
    }
    onSubmit(tossWinner, decision);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Start Toss</h2>
        <label>
          Winner:
          <select value={tossWinner} onChange={(e) => setTossWinner(e.target.value)}>
            <option value="">Select Team</option>
            {match.teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Decision:
          <select value={decision} onChange={(e) => setDecision(e.target.value)}>
            <option value="">Select</option>
            <option value="bat">Bat First</option>
            <option value="bowl">Bowl First</option>
          </select>
        </label>
        <div style={{ textAlign: "right", marginTop: "1rem" }}>
          <button className={styles.button} onClick={handleSubmit}>
            Submit
          </button>
          <button className={styles.button} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
