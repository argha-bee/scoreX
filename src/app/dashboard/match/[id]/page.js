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
//   const [canStartGame, setCanStartGame] = useState(false);
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

//   useEffect(() => {
//     if (match) {
//       console.log(match);
//       const playersPerSide = match.totalWickets + 1;
//       const squadsComplete = match.teams.every(
//         (t) => Array.isArray(t.players) && t.players.length === playersPerSide
//       );
//       setPlayersCompleted(squadsComplete);
//       setCanStartGame(match.state === "toss");
//       getTossWinnerName();
//     }
//   }, [match]);

//   if (loading) return <p className={styles.center}>Loading match...</p>;
//   if (!match) return <p className={styles.center}>Match not found</p>;

//   // const playersPerSide = match.totalWickets + 1 || 11;
//   // const squadsComplete = match.teams.every(
//   //   (t) => Array.isArray(t.players) && t.players.length === playersPerSide
//   // );
//   // const canToss = squadsComplete && !match.tossWinner && match.status === "scheduled";
//   // const canStartGame = match.tossWinner && match.status === "toss";

//   const handleSquadSave = (updatedMatch) => {
//     setMatch(updatedMatch);
//     setShowSquadModal(false);
//   };

//   const getTossWinnerName = () => {
//     setTossWinner(
//       match.tossWinner === match.teams[0]._id ? match.teams[0].name : match.teams[1].name
//     );
//   };

//   const handleTossSubmit = async (tossWinner, decision) => {
//     try {
//       await axios.post(`/api/match/${id}/toss`, { tossWinner, decision });
//       fetchMatch();
//       setShowTossModal(false);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to record toss");
//     }
//   };

//   const updateScores = () => router.push(`/dashboard/match/${id}/update-score`);
//   const liveScores = () => router.push(`/dashboard/match/${id}/live-score`);

//   /* ---------------- ROLE ICON ---------------- */
//   const roleIcon = (role) => {
//     if (role.toLowerCase().includes("bat")) return <GiCricketBat className={styles.icon} />;
//     if (role.toLowerCase().includes("bowl")) return <BiCricketBall className={styles.icon} />;
//     if (role.toLowerCase().includes("wicket")) return <GiBaseballGlove className={styles.icon} />;
//     if (role.toLowerCase().includes("all"))
//       return (
//         <>
//           <GiCricketBat className={styles.icon} />
//           <BiCricketBall className={styles.icon} />
//         </>
//       );
//     return null;
//   };

//   return (
//     <div className={styles.container}>
//       <h1 className={styles.title}>{match.teams.map((t) => t.shortName).join(" vs ")}</h1>

//       <div className={styles.info}>
//         <p>
//           <strong>Status:</strong> {match.state.toUpperCase()}
//         </p>
//         <p>
//           <strong>Date:</strong> {new Date(match.date).toLocaleString()}
//         </p>
//         <p>
//           <strong>Venue:</strong> {match.venue || "N/A"}
//         </p>
//       </div>

//       <div className={styles.actions}>
//         {!match.tossWinner && (
//           <button onClick={() => setShowSquadModal(true)}>
//             {playersCompleted ? "Update Squad" : "Declare Squad"}
//           </button>
//         )}
//         {playersCompleted && !canStartGame && (
//           <button onClick={() => setShowTossModal(true)}>Start Toss</button>
//         )}
//         {canStartGame && <button onClick={updateScores}>Update Scores</button>}
//         {canStartGame && <button onClick={liveScores}>View Live Scores</button>}
//       </div>

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
//           setCanStartGame={setCanStartGame}
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
//                   key={p._id}
//                   className={styles.playerCard}
//                   onClick={() => router.push(`/dashboard/profile/${p._id}`)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <div className={styles.playerHeader}>
//                     <span className={styles.playerName}>{p.name}</span>
//                     <span className={styles.playerJersey}>#{p.jerseyNumber}</span>
//                   </div>
//                   <div className={styles.playerRole}>
//                     {roleIcon(p.role)} {p.role}
//                   </div>
//                   <div>Batting: {p.battingStyle}</div>
//                   <div>Bowling: {p.bowlingStyle}</div>
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
  const [playersCompleted, setPlayersCompleted] = useState(false);
  const [tossWinner, setTossWinner] = useState("");

  /* ---------------- FETCH MATCH ---------------- */
  const fetchMatch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/match/${id}`);
      if (res.data.success) setMatch(res.data.match);
      else alert("Failed to fetch match");
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

  /* ---------------- CHECK SQUADS AND TOSS ---------------- */
  useEffect(() => {
    if (!match) return;

    const playersPerSide = match.totalWickets + 1;
    const squadsComplete = match.teams.every(
      (t) =>
        Array.isArray(t.players) &&
        t.players.length === playersPerSide &&
        t.players.every((p) => p.name && p.role && p.jerseyNumber)
    );

    setPlayersCompleted(squadsComplete);

    if (match.tossWinner) {
      const winner =
        match.teams[0]._id.toString() === match.tossWinner.toString()
          ? match.teams[0].name
          : match.teams[1].name;
      setTossWinner(winner);
    } else {
      setTossWinner("");
    }
  }, [match]);

  if (loading) return <p className={styles.center}>Loading match...</p>;
  if (!match) return <p className={styles.center}>Match not found</p>;

  /* ---------------- ROLE ICON ---------------- */
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

  /* ---------------- MODAL HANDLERS ---------------- */
  const handleSquadSave = (updatedMatch) => {
    setMatch(updatedMatch);
    setShowSquadModal(false);
  };

  const handleTossSubmit = async (winner, decision) => {
    try {
      await axios.post(`/api/match/${id}/toss`, { tossWinner: winner, decision });
      fetchMatch();
      setShowTossModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to record toss");
    }
  };

  /* ---------------- GAME NAVIGATION ---------------- */
  const updateScores = () => router.push(`/dashboard/match/${id}/update-score`);
  const liveScores = () => router.push(`/dashboard/match/${id}/live-score`);

  /* ---------------- BUTTON LOGIC ---------------- */
  const renderActionButtons = () => {
    if (match.state === "scheduled") {
      return (
        <>
          <button onClick={() => setShowSquadModal(true)}>
            {playersCompleted ? "Update Squad" : "Declare Squad"}
          </button>
          {playersCompleted && !match.tossWinner && (
            <button onClick={() => setShowTossModal(true)}>Start Toss</button>
          )}
        </>
      );
    }
    if (match.state === "toss" || match.state === "ready-to-start") {
      return (
        <>
          <button onClick={updateScores}>Update Scores</button>
          <button onClick={liveScores}>View Live Scores</button>
        </>
      );
    }
    if (
      match.state === "in-progress" ||
      match.state === "1st-innings" ||
      match.state === "2nd-innings"
    ) {
      return <button onClick={liveScores}>View Live Scores</button>;
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{match.teams.map((t) => t.shortName).join(" vs ")}</h1>

      <div className={styles.info}>
        <p>
          <strong>Status:</strong> {match.state.replaceAll("-", " ").toUpperCase()}
        </p>
        <p>
          <strong>Date:</strong> {new Date(match.date).toLocaleString()}
        </p>
        <p>
          <strong>Venue:</strong> {match.venue || "N/A"}
        </p>
      </div>

      <div className={styles.actions}>{renderActionButtons()}</div>

      {showSquadModal && (
        <SquadModal
          match={match}
          isDeclare={!playersCompleted}
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

      {/* ================= TEAM WISE SQUADS ================= */}
      <div className={styles.teamContainer}>
        {match.teams.map((team) => (
          <div key={team._id} className={styles.teamCard}>
            <h3 className={styles.teamName}>{team.name}</h3>
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
                  <div>Batting: {p.battingStyle || "N/A"}</div>
                  <div>Bowling: {p.bowlingStyle || "N/A"}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {match.tossWinner && (
        <p className={styles.tossInfo}>
          <strong>Toss:</strong> <u>{tossWinner}</u> chose to <u>{match.tossDecision}</u>
        </p>
      )}
    </div>
  );
}
