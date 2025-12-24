// /dashboard/match/[id]/page.js - FIXED VERSION
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import SquadModal from "@/components/SquadModal";
import TossModal from "@/components/TossModal";
import styles from "@/styles/Match.module.css";
import { useParams, useRouter } from "next/navigation";
import { GiBaseballGlove, GiCricketBat } from "react-icons/gi";
import { BiCricketBall } from "react-icons/bi";

export default function MatchPage() {
  const { id } = useParams();
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [showTossModal, setShowTossModal] = useState(false);

  const fetchMatch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/match/${id}`);
      if (res.data.success) {
        setMatch(res.data.match);
      } else {
        alert("Failed to fetch match");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching match");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  if (loading) return <p className={styles.center}>Loading match...</p>;
  if (!match) return <p className={styles.center}>Match not found</p>;

  // Check if squads are complete
  const playersPerSide = match.totalWickets + 1;
  const squadsComplete = match.teams.every(
    (t) =>
      Array.isArray(t.players) &&
      t.players.length === playersPerSide &&
      t.players.every((p) => p.name && p.role && p.jerseyNumber)
  );

  // Get toss winner name
  const getTossWinnerName = () => {
    if (!match.tossWinner) return null;
    const winner = match.teams.find((t) => t._id?.toString() === match.tossWinner?.toString());
    return winner?.name;
  };

  const tossWinnerName = getTossWinnerName();

  // Role icon helper
  const roleIcon = (role) => {
    if (!role) return null;
    const r = role.toLowerCase();
    if (r.includes("bat")) return <GiCricketBat className={styles.icon} />;
    if (r.includes("bowl")) return <BiCricketBall className={styles.icon} />;
    if (r.includes("wicket")) return <GiBaseballGlove className={styles.icon} />;
    if (r.includes("all"))
      return (
        <>
          <GiCricketBat className={styles.icon} />
          <BiCricketBall className={styles.icon} />
        </>
      );
    return null;
  };

  // Modal handlers
  const handleSquadSave = (updatedMatch) => {
    setMatch(updatedMatch);
    setShowSquadModal(false);
  };

  const handleTossSubmit = async (winner, decision) => {
    try {
      await axios.post(`/api/match/${id}/toss`, { tossWinner: winner, decision });
      await fetchMatch();
      setShowTossModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to record toss");
    }
  };


  const updateScores = () => router.push(`/dashboard/match/${id}/update-score`);
  const liveScores = () => router.push(`/dashboard/match/${id}/live-score`);
  const viewSummary = () => router.push(`/dashboard/match/${id}/summary`);

  const renderActionButtons = () => {
    if (match.state === "scheduled" || "ready-to-start") {
      return (
        <>
          <button onClick={() => setShowSquadModal(true)} className={styles.btn}>
            {squadsComplete ? "Update Squad" : "Declare Squad"}
          </button>
          {squadsComplete && !match.tossWinner && (
            <button onClick={() => setShowTossModal(true)} className={styles.btn}>
              Conduct Toss
            </button>
          )}
        </>
      );
    }

    if (match.state === "toss") {
      return (
        <>
          <button onClick={updateScores} className={styles.primaryBtn}>
            Start Match
          </button>
          <button onClick={liveScores} className={styles.btn}>
            View Live Scores
          </button>
        </>
      );
    }

    if (
      match.state === "1st-innings" ||
      match.state === "2nd-innings" ||
      match.state === "innings-break"
    ) {
      return (
        <>
          <button onClick={updateScores} className={styles.primaryBtn}>
            Update Scores
          </button>
          <button onClick={liveScores} className={styles.btn}>
            View Live Scores
          </button>
        </>
      );
    }

    if (match.state === "finished") {
      return (
        <>
          <button onClick={viewSummary} className={styles.primaryBtn}>
            View Match Summary
          </button>
          <button onClick={liveScores} className={styles.btn}>
            View Live Scores
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      {/* Match Header */}
      <div className={styles.matchHeader}>
        <h1 className={styles.title}>{match.title}</h1>
        <div className={styles.versus}>{match.teams.map((t) => t.shortName).join(" vs ")}</div>
      </div>

      {/* Match Info Card */}
      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Status:</span>
          <span className={styles.value}>{match.state.replaceAll("-", " ").toUpperCase()}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Date:</span>
          <span className={styles.value}>{new Date(match.date).toLocaleString()}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Venue:</span>
          <span className={styles.value}>{match.venue || "N/A"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Format:</span>
          <span className={styles.value}>
            {match.format} ({match.overs} overs)
          </span>
        </div>
        {tossWinnerName && (
          <div className={styles.infoRow}>
            <span className={styles.label}>Toss:</span>
            <span className={styles.value}>
              {tossWinnerName} chose to {match.tossDecision}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>{renderActionButtons()}</div>

      {/* Modals */}
      {showSquadModal && (
        <SquadModal
          match={match}
          isDeclare={!squadsComplete}
          onClose={() => setShowSquadModal(false)}
          onSave={handleSquadSave}
        />
      )}

      {showTossModal && (
        <TossModal
          match={match}
          onClose={() => setShowTossModal(false)}
          onSubmit={handleTossSubmit}
        />
      )}

      {/* Team Squads */}
      <div className={styles.teamContainer}>
        {match.teams.map((team) => (
          <div key={team._id} className={styles.teamCard}>
            <h3 className={styles.teamName}>{team.name}</h3>

            {team.players && team.players.length > 0 ? (
              <div className={styles.playersGrid}>
                {team.players.map((p) => (
                  <div
                    key={p._id || p.name}
                    className={styles.playerCard}
                    onClick={() => p._id && router.push(`/dashboard/profile/${p._id}`)}
                    style={{ cursor: p._id ? "pointer" : "default" }}
                  >
                    <div className={styles.playerHeader}>
                      <span className={styles.playerName}>{p.name}</span>
                      <span className={styles.playerJersey}>#{p.jerseyNumber}</span>
                    </div>
                    <div className={styles.playerRole}>
                      {roleIcon(p.role)} {p.role || "N/A"}
                    </div>
                    <div className={styles.playerStyle}>
                      <small>Batting: {p.battingStyle || "N/A"}</small>
                    </div>
                    <div className={styles.playerStyle}>
                      <small>Bowling: {p.bowlingStyle || "N/A"}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptySquad}>Squad not declared yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import SquadModal from "@/components/SquadModal";
// import TossModal from "@/components/TossModal";
// import styles from "@/styles/Match.module.css";
// import { useParams, useRouter } from "next/navigation";
// import { GiBaseballGlove, GiCricketBat } from "react-icons/gi";
// import { BiCricketBall } from "react-icons/bi";

// export default function MatchPage() {
//   const { id } = useParams();
//   const router = useRouter();

//   const [match, setMatch] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showSquadModal, setShowSquadModal] = useState(false);
//   const [showTossModal, setShowTossModal] = useState(false);
//   const [playersCompleted, setPlayersCompleted] = useState(false);
//   const [tossWinner, setTossWinner] = useState("");

//   /* ---------------- FETCH MATCH ---------------- */
//   const fetchMatch = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`/api/match/${id}`);
//       if (res.data.success) setMatch(res.data.match);
//       else alert("Failed to fetch match");
//     } catch (err) {
//       console.error(err);
//       alert("Error fetching match");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMatch();
//   }, [id]);

//   /* ---------------- CHECK SQUADS AND TOSS ---------------- */
//   useEffect(() => {
//     if (!match) return;

//     const playersPerSide = match.totalWickets + 1;
//     const squadsComplete = match.teams.every(
//       (t) =>
//         Array.isArray(t.players) &&
//         t.players.length === playersPerSide &&
//         t.players.every((p) => p.name && p.role && p.jerseyNumber)
//     );

//     setPlayersCompleted(squadsComplete);

//     if (match.tossWinner) {
//       const winner =
//         match.teams[0]._id.toString() === match.tossWinner.toString()
//           ? match.teams[0].name
//           : match.teams[1].name;
//       setTossWinner(winner);
//     } else {
//       setTossWinner("");
//     }
//   }, [match]);

//   if (loading) return <p className={styles.center}>Loading match...</p>;
//   if (!match) return <p className={styles.center}>Match not found</p>;

//   /* ---------------- ROLE ICON ---------------- */
//   const roleIcon = (role) => {
//     if (!role) return null;
//     const r = role.toLowerCase();
//     if (r.includes("bat")) return <GiCricketBat className={styles.icon} />;
//     if (r.includes("bowl")) return <BiCricketBall className={styles.icon} />;
//     if (r.includes("wicket")) return <GiBaseballGlove className={styles.icon} />;
//     if (r.includes("all"))
//       return (
//         <>
//           <GiCricketBat className={styles.icon} />
//           <BiCricketBall className={styles.icon} />
//         </>
//       );
//     return null;
//   };

//   /* ---------------- MODAL HANDLERS ---------------- */
//   const handleSquadSave = (updatedMatch) => {
//     setMatch(updatedMatch);
//     setShowSquadModal(false);
//   };

//   const handleTossSubmit = async (winner, decision) => {
//     try {
//       await axios.post(`/api/match/${id}/toss`, { tossWinner: winner, decision });
//       fetchMatch();
//       setShowTossModal(false);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to record toss");
//     }
//   };

//   /* ---------------- GAME NAVIGATION ---------------- */
//   const updateScores = () => router.push(`/dashboard/match/${id}/update-score`);
//   const liveScores = () => router.push(`/dashboard/match/${id}/live-score`);

//   /* ---------------- BUTTON LOGIC ---------------- */
//   const renderActionButtons = () => {
//     if (match.state === "scheduled") {
//       return (
//         <>
//           <button onClick={() => setShowSquadModal(true)}>
//             {playersCompleted ? "Update Squad" : "Declare Squad"}
//           </button>
//           {playersCompleted && !match.tossWinner && (
//             <button onClick={() => setShowTossModal(true)}>Start Toss</button>
//           )}
//         </>
//       );
//     }
//     if (match.state === "toss" || match.state === "ready-to-start") {
//       return (
//         <>
//           <button onClick={updateScores}>Update Scores</button>
//           <button onClick={liveScores}>View Live Scores</button>
//         </>
//       );
//     }
//     if (
//       match.state === "in-progress" ||
//       match.state === "1st-innings" ||
//       match.state === "2nd-innings"
//     ) {
//       return <button onClick={liveScores}>View Live Scores</button>;
//     }
//     return null;
//   };

//   return (
//     <div className={styles.container}>
//       <h1 className={styles.title}>{match.teams.map((t) => t.shortName).join(" vs ")}</h1>

//       <div className={styles.info}>
//         <p>
//           <strong>Status:</strong> {match.state.replaceAll("-", " ").toUpperCase()}
//         </p>
//         <p>
//           <strong>Date:</strong> {new Date(match.date).toLocaleString()}
//         </p>
//         <p>
//           <strong>Venue:</strong> {match.venue || "N/A"}
//         </p>
//       </div>

//       <div className={styles.actions}>{renderActionButtons()}</div>

//       {showSquadModal && (
//         <SquadModal
//           match={match}
//           isDeclare={!playersCompleted}
//           onClose={() => setShowSquadModal(false)}
//           onSave={handleSquadSave}
//         />
//       )}

//       {showTossModal && (
//         <TossModal
//           match={match}
//           onClose={() => setShowTossModal(false)}
//           onSubmit={handleTossSubmit}
//         />
//       )}

//       {/* ================= TEAM WISE SQUADS ================= */}
//       <div className={styles.teamContainer}>
//         {match.teams.map((team) => (
//           <div key={team._id} className={styles.teamCard}>
//             <h3 className={styles.teamName}>{team.name}</h3>
//             <div className={styles.playersGrid}>
//               {team.players.map((p) => (
//                 <div
//                   key={p._id || p.name}
//                   className={styles.playerCard}
//                   onClick={() => p._id && router.push(`/dashboard/profile/${p._id}`)}
//                   style={{ cursor: p._id ? "pointer" : "default" }}
//                 >
//                   <div className={styles.playerHeader}>
//                     <span className={styles.playerName}>{p.name}</span>
//                     <span className={styles.playerJersey}>#{p.jerseyNumber}</span>
//                   </div>
//                   <div className={styles.playerRole}>
//                     {roleIcon(p.role)} {p.role || "N/A"}
//                   </div>
//                   <div>Batting: {p.battingStyle || "N/A"}</div>
//                   <div>Bowling: {p.bowlingStyle || "N/A"}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {match.tossWinner && (
//         <p className={styles.tossInfo}>
//           <strong>Toss:</strong> <u>{tossWinner}</u> chose to <u>{match.tossDecision}</u>
//         </p>
//       )}
//     </div>
//   );
// }
