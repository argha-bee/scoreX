"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "@/styles/TossModal.module.css"; // reuse styles

export default function SquadModal({ match, onClose, onSave }) {
  const [teams, setTeams] = useState(
    match.teams.map((t) => ({
      ...t,
      players: t.players?.length ? t.players : Array(11).fill(""),
      captain: t.captain || "",
      wicketKeeper: t.wicketKeeper || "",
    }))
  );
  const [loading, setLoading] = useState(false);

  const handlePlayerChange = (teamIndex, playerIndex, value) => {
    const newTeams = [...teams];
    newTeams[teamIndex].players[playerIndex] = value;
    setTeams(newTeams);
  };

  const handleSave = async () => {
    // Validation: captain & wk must be in players list
    for (let t of teams) {
      if (!t.captain || !t.players.includes(t.captain)) {
        Swal.fire("Error", `Select a valid captain for ${t.name}`, "error");
        return;
      }
      if (!t.wicketKeeper || !t.players.includes(t.wicketKeeper)) {
        Swal.fire("Error", `Select a valid wicket-keeper for ${t.name}`, "error");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.post(`/api/match/${match._id}/update-squad`, { teams });
      Swal.fire("Success", "Squad updated!", "success");
      onSave(res.data.match);
    } catch (err) {
      Swal.fire("Error", "Failed to update squad", "error");
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
        <h2 className={styles.title}>Declare / Update Squads</h2>

        {teams.map((team, ti) => (
          <div key={ti}>
            <h3>{team.name}</h3>
            {team.players.map((player, pi) => (
              <input
                key={pi}
                placeholder={`Player ${pi + 1}`}
                value={player}
                onChange={(e) => handlePlayerChange(ti, pi, e.target.value)}
                style={{ display: "block", width: "100%", margin: "0.3rem 0", padding: "0.5rem" }}
              />
            ))}

            <input
              placeholder="Captain"
              value={team.captain}
              onChange={(e) =>
                setTeams([
                  ...teams.slice(0, ti),
                  { ...team, captain: e.target.value },
                  ...teams.slice(ti + 1),
                ])
              }
              style={{ display: "block", width: "100%", margin: "0.3rem 0", padding: "0.5rem" }}
            />

            <input
              placeholder="Wicket-Keeper"
              value={team.wicketKeeper}
              onChange={(e) =>
                setTeams([
                  ...teams.slice(0, ti),
                  { ...team, wicketKeeper: e.target.value },
                  ...teams.slice(ti + 1),
                ])
              }
              style={{ display: "block", width: "100%", margin: "0.3rem 0", padding: "0.5rem" }}
            />
          </div>
        ))}

        <button className={styles.startBtn} onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Squad"}
        </button>
      </div>
    </div>
  );
}
