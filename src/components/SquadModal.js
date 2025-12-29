
"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import styles from "@/styles/SquadModal.module.css";

const emptyPlayer = {
  name: "",
  jerseyNumber: "",
  role: "",
  battingStyle: "right-hand",
  bowlingStyle: "none",
};

export default function SquadModal({ match, onClose, onSave, isDeclare }) {
  const totalPlayers = match.totalWickets + 1;
  const isLocked = match.state !== "scheduled";

  const [teams, setTeams] = useState(() =>
    match.teams.map((team) => ({
      _id: team._id,
      name: team.name,
      players: Array.from({ length: totalPlayers }, (_, i) => {
        const p = team.players?.[i];
        return p
          ? {
              _id: p._id || null, 
              name: p.name || "",
              jerseyNumber: p.jerseyNumber || "",
              role: p.role || "",
              battingStyle: p.battingStyle || "right-hand",
              bowlingStyle: p.bowlingStyle || "none",
            }
          : { ...emptyPlayer };
      }),
      captain: team.captain || "",
      wicketKeeper: team.wicketKeeper || "",
    }))
  );

  const [loading, setLoading] = useState(false);

  const updatePlayer = (ti, pi, field, value) => {
    if (isLocked) return;

    setTeams((prev) =>
      prev.map((team, tIndex) =>
        tIndex !== ti
          ? team
          : {
              ...team,
              players: team.players.map((player, pIndex) =>
                pIndex !== pi ? player : { ...player, [field]: value }
              ),
            }
      )
    );
  };

  const updateTeamField = (ti, field, value) => {
    if (isLocked) return;
    setTeams((prev) => prev.map((team, i) => (i === ti ? { ...team, [field]: value } : team)));
  };

  const jerseyErrors = useMemo(() => {
    const errors = {};
    teams.forEach((team, ti) => {
      const seen = new Set();
      team.players.forEach((p, pi) => {
        if (!p.jerseyNumber) return;
        if (seen.has(p.jerseyNumber)) {
          errors[`${ti}-${pi}`] = true;
        }
        seen.add(p.jerseyNumber);
      });
    });
    return errors;
  }, [teams]);

  const validateTeams = () => {
    for (const team of teams) {
      for (const p of team.players) {
        if (!p.name || !p.role || !p.jerseyNumber) {
          alert(`All player fields required in ${team.name}`);
          return false;
        }
      }
      if (!team.players.find((p) => p.name === team.captain)) {
        alert(`Select a valid captain for ${team.name}`);
        return false;
      }
      if (!team.players.find((p) => p.name === team.wicketKeeper)) {
        alert(`Select a valid wicket-keeper for ${team.name}`);
        return false;
      }
    }

    if (Object.keys(jerseyErrors).length > 0) {
      alert("Duplicate jersey numbers detected");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (isLocked) return;
    if (!validateTeams()) return;

    setLoading(true);

    try {
      const method = isDeclare ? "post" : "put";

      const payload = {
        teams: teams.map((team) => ({
          _id: team._id,
          captain: team.captain,
          wicketKeeper: team.wicketKeeper,
          players: team.players.map((p) => ({
            _id: p._id || null, 
            name: p.name.trim(),
            jerseyNumber: p.jerseyNumber,
            role: p.role,
            battingStyle: p.battingStyle || "right-hand",
            bowlingStyle: p.bowlingStyle || "none",
          })),
        })),
      };

      const res = await axios({
        url: `/api/match/${match._id}/squads`,
        method,
        data: payload,
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        onSave(res.data.match);
        onClose();
      } else {
        alert(res.data.message || "Failed to save squad");
      }
    } catch (err) {
      console.error("Squad save error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save squad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>
          {isLocked ? "Squads Locked (After Toss)" : isDeclare ? "Declare Squads" : "Update Squads"}
        </h2>

        {teams.map((team, ti) => (
          <div key={team._id} className={styles.teamBlock}>
            <h3>
              {team.name} ({totalPlayers} Players)
            </h3>

            {team.players.map((player, pi) => {
              const hasJerseyError = jerseyErrors[`${ti}-${pi}`];

              return (
                <div key={pi} className={styles.playerRow}>
                  <strong>Player {pi + 1}</strong>

                  <input
                    disabled={isLocked}
                    placeholder="Name"
                    value={player.name}
                    onChange={(e) => updatePlayer(ti, pi, "name", e.target.value)}
                  />

                  <input
                    disabled={isLocked}
                    type="number"
                    placeholder="Jersey"
                    className={hasJerseyError ? styles.error : ""}
                    value={player.jerseyNumber}
                    onChange={(e) => updatePlayer(ti, pi, "jerseyNumber", e.target.value)}
                  />

                  <select
                    disabled={isLocked || !player.name}
                    value={player.role}
                    onChange={(e) => updatePlayer(ti, pi, "role", e.target.value)}
                  >
                    <option value="">Role</option>
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="all-rounder">All-rounder</option>
                    <option value="wicket-keeper">Wicket-keeper</option>
                  </select>

                  {["batsman", "all-rounder", "wicket-keeper"].includes(player.role) && (
                    <select
                      disabled={isLocked}
                      value={player.battingStyle}
                      onChange={(e) => updatePlayer(ti, pi, "battingStyle", e.target.value)}
                    >
                      <option value="right-hand">Right-hand</option>
                      <option value="left-hand">Left-hand</option>
                    </select>
                  )}

                  {["bowler", "all-rounder"].includes(player.role) && (
                    <select
                      disabled={isLocked}
                      value={player.bowlingStyle}
                      onChange={(e) => updatePlayer(ti, pi, "bowlingStyle", e.target.value)}
                    >
                      <option value="right-arm">Right-arm</option>
                      <option value="left-arm">Left-arm</option>
                      <option value="none">None</option>
                    </select>
                  )}
                </div>
              );
            })}

            <div className={styles.teamRoles}>
              <label>
                Captain
                <select
                  disabled={isLocked}
                  value={team.captain}
                  onChange={(e) => updateTeamField(ti, "captain", e.target.value)}
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
                  disabled={isLocked}
                  value={team.wicketKeeper}
                  onChange={(e) => updateTeamField(ti, "wicketKeeper", e.target.value)}
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
          {!isLocked && (
            <button className={styles.saveButton} onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Squad"}
            </button>
          )}

          <button className={styles.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
