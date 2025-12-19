"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/Dashboard.module.css";
import { useParams } from "next/navigation";

export default function MatchPage() {
  const { id } = useParams();
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

  const [showViewSquads, setShowViewSquads] = useState(false);
  const [squads, setSquads] = useState([]);
  const [loadingSquads, setLoadingSquads] = useState(false);

  // Toss modal state
  const [showTossModal, setShowTossModal] = useState(false);
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");

  const fetchSquads = async () => {
    setLoadingSquads(true);
    try {
      const res = await axios.get(`/api/match/${id}/squads`);
      if (res.data.success) {
        setSquads(res.data.squads);
        setShowViewSquads(true);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch squads");
    } finally {
      setLoadingSquads(false);
    }
  };

  const fetchMatch = async () => {
    try {
      const res = await axios.get(`/api/match/${id}`);
      if (res.data.success) {
        setMatch(res.data.match);

        // Initialize squad state if teams exist
        if (res.data.match.teams.length === 2) {
          const t1 = res.data.match.teams[0];
          const t2 = res.data.match.teams[1];
          setTeam1Players(t1.players || []);
          setTeam2Players(t2.players || []);
          setTeam1Captain(t1.captain || "");
          setTeam2Captain(t2.captain || "");
          setTeam1WK(t1.wicketKeeper || "");
          setTeam2WK(t2.wicketKeeper || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  // Squad handlers
  const handlePlayerChange = (team, index, value) => {
    if (team === 1)
      setTeam1Players((prev) => {
        const tmp = [...prev];
        tmp[index] = value;
        return tmp;
      });
    else
      setTeam2Players((prev) => {
        const tmp = [...prev];
        tmp[index] = value;
        return tmp;
      });
  };
  const addPlayer = (team) => {
    if (team === 1) setTeam1Players((prev) => [...prev, ""]);
    else setTeam2Players((prev) => [...prev, ""]);
  };

  const saveSquad = async () => {
    try {
      await axios.post(`/api/match/${id}/update-squad`, {
        team1Players,
        team2Players,
        team1Captain,
        team2Captain,
        team1WK,
        team2WK,
      });
      alert("Squad saved");
      setShowSquadModal(false);
      fetchMatch();
    } catch (err) {
      alert("Failed to save squad");
    }
  };

  // Toss handler
  const startToss = async () => {
    try {
      await axios.post(`/api/match/${id}/toss`, { tossWinner, decision });
      alert("Toss recorded");
      setShowTossModal(false);
      fetchMatch();
    } catch (err) {
      alert("Failed to record toss");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading match...</p>;
  if (!match) return <p style={{ textAlign: "center" }}>Match not found</p>;

  const canToss = match.teams.every((t) => t.players.length > 0 && t.captain && t.wicketKeeper);

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h1>{match.teams.map((t) => t.shortName).join(" vs ")}</h1>
      <p>Status: {match.status.toUpperCase()}</p>
      <p>Date: {new Date(match.date).toLocaleString()}</p>
      <p>Venue: {match.venue || "N/A"}</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button onClick={() => setShowSquadModal(true)} style={buttonStyle}>
          Declare Squad
        </button>
        <button
          onClick={() => setShowTossModal(true)}
          disabled={!canToss || match.status !== "upcoming"}
          style={{
            ...buttonStyle,
            backgroundColor: canToss && match.status === "upcoming" ? "#4f46e5" : "#ccc",
          }}
        >
          Start Toss
        </button>
        <button onClick={fetchSquads} style={buttonStyle} disabled={loadingSquads}>
          {loadingSquads ? "Loading..." : "View Squads"}
        </button>
      </div>
      {showViewSquads && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Match Squads</h2>
            {squads.map((team) => (
              <div key={team._id} style={{ marginBottom: "1rem" }}>
                <h3>{team.name}</h3>
                <p>
                  <strong>Captain:</strong> {team.captain?.name || "N/A"} | <strong>WK:</strong>{" "}
                  {team.wicketKeeper?.name || "N/A"}
                </p>
                <ul>
                  {team.players.map((p) => (
                    <li key={p._id}>{p.name}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setShowViewSquads(false)} className={styles.button}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Squad Modal */}
      {showSquadModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Declare Squad</h2>
            {match.teams.map((team, idx) => (
              <div key={team._id} style={{ marginBottom: "1rem" }}>
                <h3>{team.name}</h3>
                {(idx === 0 ? team1Players : team2Players).map((p, i) => (
                  <input
                    key={i}
                    value={p}
                    placeholder={`Player ${i + 1}`}
                    onChange={(e) => handlePlayerChange(idx + 1, i, e.target.value)}
                    className={styles.input}
                  />
                ))}
                <button onClick={() => addPlayer(idx + 1)} className={styles.smallButton}>
                  Add Player
                </button>

                <div style={{ marginTop: "0.5rem" }}>
                  <label>
                    Captain:
                    <select
                      value={idx === 0 ? team1Captain : team2Captain}
                      onChange={(e) =>
                        idx === 0
                          ? setTeam1Captain(e.target.value)
                          : setTeam2Captain(e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {(idx === 0 ? team1Players : team2Players).map((p, i) => (
                        <option key={i} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ marginLeft: "1rem" }}>
                    WK:
                    <select
                      value={idx === 0 ? team1WK : team2WK}
                      onChange={(e) =>
                        idx === 0 ? setTeam1WK(e.target.value) : setTeam2WK(e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {(idx === 0 ? team1Players : team2Players).map((p, i) => (
                        <option key={i} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
            <div style={{ textAlign: "right", marginTop: "1rem" }}>
              <button onClick={saveSquad} className={styles.button}>
                Save
              </button>
              <button onClick={() => setShowSquadModal(false)} className={styles.button}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toss Modal */}
      {showTossModal && (
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
              <button onClick={startToss} className={styles.button}>
                Submit
              </button>
              <button onClick={() => setShowTossModal(false)} className={styles.button}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "0.5rem 1rem",
  backgroundColor: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
