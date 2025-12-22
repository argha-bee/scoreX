"use client";

import { useState } from "react";
import axios from "axios";
import styles from "@/styles/SquadModal.module.css";

const emptyPlayer = {
  name: "",
  jerseyNumber: "",
  role: "",
  battingStyle: "right-hand", // default to avoid empty
  bowlingStyle: "none", // default to avoid enum validation errors
};

export default function SquadModal({ match, onClose, onSave, isDeclare }) {
  const maxPlayers = match.totalWickets + 1;

  const [teams, setTeams] = useState(
    match.teams.map((t) => ({
      _id: t._id,
      name: t.name,
      players:
        t.players && t.players.length > 0
          ? t.players.map((p) => ({
              ...p,
              battingStyle: p.battingStyle || "right-hand",
              bowlingStyle: p.bowlingStyle || "none",
            }))
          : [{ ...emptyPlayer }],
      captain: t.captain || "",
      wicketKeeper: t.wicketKeeper || "",
    }))
  );

  const [loading, setLoading] = useState(false);

  const updatePlayer = (ti, pi, field, value) => {
    setTeams((prev) => {
      const updated = [...prev];
      updated[ti].players[pi][field] = value;
      return updated;
    });
  };

  const addPlayer = (ti) => {
    setTeams((prev) => {
      const updated = [...prev];
      if (updated[ti].players.length >= maxPlayers) {
        alert(`Maximum ${maxPlayers} players allowed`);
        return prev;
      }
      updated[ti].players.push({ ...emptyPlayer });
      return updated;
    });
  };

  const removePlayer = (ti, pi) => {
    setTeams((prev) => {
      const updated = [...prev];
      updated[ti].players.splice(pi, 1);
      return updated;
    });
  };

  const validateTeams = () => {
    for (const team of teams) {
      if (team.players.length !== maxPlayers) {
        alert(`${team.name} must have exactly ${maxPlayers} players`);
        return false;
      }

      const seen = new Set();

      for (const p of team.players) {
        if (!p.name || !p.jerseyNumber || !p.role) {
          alert(`All player fields are required in ${team.name}`);
          return false;
        }

        if (
          (p.role === "batsman" || p.role === "wicket-keeper" || p.role === "all-rounder") &&
          !p.battingStyle
        ) {
          alert(`Batting style required for ${p.name}`);
          return false;
        }

        if ((p.role === "bowler" || p.role === "all-rounder") && !p.bowlingStyle) {
          alert(`Bowling style required for ${p.name}`);
          return false;
        }

        const key = `${p.name.toLowerCase()}-${p.jerseyNumber}`;
        if (seen.has(key)) {
          alert(`Duplicate player: ${p.name} (#${p.jerseyNumber})`);
          return false;
        }
        seen.add(key);
      }

      if (!team.captain || !team.players.find((p) => p.name === team.captain)) {
        alert(`Select a valid captain for ${team.name}`);
        return false;
      }

      if (!team.wicketKeeper || !team.players.find((p) => p.name === team.wicketKeeper)) {
        alert(`Select a valid wicket-keeper for ${team.name}`);
        return false;
      }
    }

    return true;
  };

  // const handleSave = async () => {
  //   if (!validateTeams()) return;

  //   setLoading(true);
  //   try {
  //     const res = await axios.post(
  //       `/api/match/${match._id}/squads`,
  //       { teams },
  //       { headers: { "Content-Type": "application/json" } }
  //     );

  //     if (res.data.success) {
  //       onSave(res.data.match);
  //       onClose();
  //     } else {
  //       alert(res.data.message || "Failed to save squad");
  //     }
  //   } catch (err) {
  //     console.error("Axios error:", err.response?.data || err.message);
  //     alert(err.response?.data?.message || "Failed to save squad");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSave = async () => {
    if (!validateTeams()) return;

    setLoading(true);
    try {
      const method = isDeclare ? "post" : "put"; // POST = declare, PUT = update
      const res = await axios({
        url: `/api/match/${match._id}/squads`,
        method,
        data: { teams },
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        onSave(res.data.match);
        onClose();
      } else {
        alert(res.data.message || "Failed to save squad");
      }
    } catch (err) {
      console.error("Axios error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save squad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>{isDeclare ? "Declare" : "Update"} Squads</h2>

        {teams.map((team, ti) => (
          <div key={team._id} className={styles.teamBlock}>
            <h3>
              {team.name} ({team.players.length}/{maxPlayers})
            </h3>

            {team.players.map((player, pi) => (
              <div key={pi} className={styles.playerRow}>
                <strong>Player {pi + 1}</strong>

                <input
                  placeholder="Player Name"
                  value={player.name}
                  onChange={(e) => updatePlayer(ti, pi, "name", e.target.value)}
                />

                <input
                  placeholder="Jersey #"
                  type="number"
                  value={player.jerseyNumber}
                  onChange={(e) => updatePlayer(ti, pi, "jerseyNumber", e.target.value)}
                />

                <select
                  value={player.role}
                  onChange={(e) => updatePlayer(ti, pi, "role", e.target.value)}
                >
                  <option value="">Role</option>
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="all-rounder">All-rounder</option>
                  <option value="wicket-keeper">Wicket-keeper</option>
                </select>

                {player.role && (
                  <select
                    value={player.battingStyle}
                    onChange={(e) => updatePlayer(ti, pi, "battingStyle", e.target.value)}
                  >
                    <option value="">Batting Style</option>
                    <option value="right-hand">Right-hand</option>
                    <option value="left-hand">Left-hand</option>
                  </select>
                )}

                {(player.role === "bowler" || player.role === "all-rounder") && (
                  <select
                    value={player.bowlingStyle}
                    onChange={(e) => updatePlayer(ti, pi, "bowlingStyle", e.target.value)}
                  >
                    <option value="">Bowling Style</option>
                    <option value="right-arm">Right-arm</option>
                    <option value="left-arm">Left-arm</option>
                    <option value="none">None</option>
                  </select>
                )}

                {team.players.length > 1 && (
                  <button className={styles.removeButton} onClick={() => removePlayer(ti, pi)}>
                    Remove Player
                  </button>
                )}
              </div>
            ))}

            <button className={styles.addButton} onClick={() => addPlayer(ti)}>
              + Add Player
            </button>

            <div className={styles.teamRoles}>
              <label>
                Captain
                <select
                  value={team.captain}
                  onChange={(e) => {
                    const updated = [...teams];
                    updated[ti].captain = e.target.value;
                    setTeams(updated);
                  }}
                >
                  <option value="">Select</option>
                  {team.players.map((p, i) => (
                    <option key={i} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Wicket-Keeper
                <select
                  value={team.wicketKeeper}
                  onChange={(e) => {
                    const updated = [...teams];
                    updated[ti].wicketKeeper = e.target.value;
                    setTeams(updated);
                  }}
                >
                  <option value="">Select</option>
                  {team.players.map((p, i) => (
                    <option key={i} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}

        <div className={styles.actions}>
          <button className={styles.saveButton} onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Squad"}
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
