// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import styles from "@/styles/ScoreUpdate.module.css";
// import { useParams } from "next/navigation";

// export default function ScoreUpdatePage() {
//   const { id } = useParams(); // match ID

//   const [match, setMatch] = useState(null);
//   const [score, setScore] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [allPlayers, setAllPlayers] = useState([]);
//   const [selectedBatsman, setSelectedBatsman] = useState(null);
//   const [selectedBowler, setSelectedBowler] = useState(null);
//   const [runsInput, setRunsInput] = useState(0);
//   const [extrasInput, setExtrasInput] = useState({ type: "", runs: 0 });
//   const [isWicket, setIsWicket] = useState(false);
//   const [wicketType, setWicketType] = useState("");
//   const [dismissedPlayer, setDismissedPlayer] = useState(null);
//   const [fielder, setFielder] = useState(null);
//   const [commentary, setCommentary] = useState("");

//   // ================= Fetch match and score =================
//   const fetchMatch = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`/api/match/${id}/scoreboard`);
//       if (res.data.match) {
//         setMatch(res.data.match);
//         setScore(res.data.match.scores[0]); // assuming 1st innings current
//         setAllPlayers(res.data.allPlayers || []);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load match");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMatch();

//     // Optionally: setup WebSocket to listen for real-time score updates
//     // broadcastScoreUpdate can update `score` and players live
//   }, [id]);

//   if (loading) return <p className={styles.center}>Loading match...</p>;
//   if (!match || !score) return <p className={styles.center}>Match data not found</p>;

//   // ================= Utility functions =================
//   const onStrikeBatsman = score.currentBatsmen.find((b) => b.onStrike);
//   const nonStrikeBatsman = score.currentBatsmen.find((b) => !b.onStrike);
//   const currentBowler = score.currentBowler;

//   // Record a ball
//   const recordBall = async () => {
//     if (!onStrikeBatsman || !currentBowler) {
//       alert("Select batsman and bowler first!");
//       return;
//     }

//     try {
//       const res = await axios.post(`/api/score/${score._id}/ball`, {
//         scoreId: score._id,
//         runs: parseInt(runsInput),
//         extras: extrasInput,
//         isWicket,
//         wicketType,
//         dismissedPlayer,
//         fielder,
//         commentary,
//       });

//       if (res.data.score) setScore(res.data.score);

//       // Reset inputs for next ball
//       setRunsInput(0);
//       setExtrasInput({ type: "", runs: 0 });
//       setIsWicket(false);
//       setWicketType("");
//       setDismissedPlayer(null);
//       setFielder(null);
//       setCommentary("");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to record ball");
//     }
//   };

//   // Change bowler (at over start)
//   const changeBowler = async (bowlerId) => {
//     try {
//       const res = await axios.post(`/api/score/${score._id}/change-bowler`, {
//         scoreId: score._id,
//         newBowlerId: bowlerId,
//       });
//       if (res.data.score) setScore(res.data.score);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to change bowler");
//     }
//   };

//   // Add new batsman (after wicket)
//   const addNewBatsman = async (batsmanId) => {
//     try {
//       const res = await axios.post(`/api/score/${score._id}/add-batsman`, {
//         scoreId: score._id,
//         newBatsmanId: batsmanId,
//       });
//       if (res.data.score) setScore(res.data.score);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add batsman");
//     }
//   };

//   // ================= Render =================
//   return (
//     <div className={styles.container}>
//       <h1 className={styles.title}>
//         {match.teams[0].shortName} vs {match.teams[1].shortName}
//       </h1>

//       {/* ================= Scoreboard ================= */}
//       <div className={styles.scoreboard}>
//         <div className={styles.innings}>
//           <h2>Innings {score.innings}</h2>
//           <p>
//             <strong>Runs:</strong> {score.runs}/{score.wickets} ({score.overs}.{score.balls} overs)
//           </p>
//           <p>
//             <strong>Run Rate:</strong> {score.runRate} | <strong>Required RR:</strong>{" "}
//             {score.requiredRunRate || "-"}
//           </p>
//           <p>
//             <strong>Extras:</strong> W:{score.extras.wides} NB:{score.extras.noBalls} B:
//             {score.extras.byes} LB:{score.extras.legByes}
//           </p>
//         </div>

//         {/* Current batsmen */}
//         <div className={styles.batsmen}>
//           <h3>Current Batsmen</h3>
//           {score.currentBatsmen.map((b, i) => (
//             <div key={i} className={styles.playerCard}>
//               <p>
//                 {b.player.name} {b.onStrike ? "(On Strike)" : ""}
//               </p>
//               <p>
//                 Runs: {b.player.battingStats.runs} Balls: {b.player.battingStats.balls} SR:{" "}
//                 {b.player.battingStats.strikeRate}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Current bowler */}
//         <div className={styles.bowler}>
//           <h3>Current Bowler</h3>
//           {currentBowler && (
//             <p>
//               {currentBowler.name} Overs: {currentBowler.bowlingStats.overs}.
//               {currentBowler.bowlingStats.balls} Runs: {currentBowler.bowlingStats.runs} Wickets:{" "}
//               {currentBowler.bowlingStats.wickets} Econ: {currentBowler.bowlingStats.economy}
//             </p>
//           )}
//         </div>
//       </div>

//       {/* ================= Controls ================= */}
//       <div className={styles.controls}>
//         <h3>Ball Entry</h3>
//         <input
//           type="number"
//           placeholder="Runs"
//           value={runsInput}
//           onChange={(e) => setRunsInput(e.target.value)}
//         />

//         <select
//           value={extrasInput.type}
//           onChange={(e) => setExtrasInput({ ...extrasInput, type: e.target.value })}
//         >
//           <option value="">Extras</option>
//           <option value="wide">Wide</option>
//           <option value="no-ball">No Ball</option>
//           <option value="bye">Bye</option>
//           <option value="leg-bye">Leg Bye</option>
//         </select>

//         <input
//           type="number"
//           placeholder="Extras runs"
//           value={extrasInput.runs}
//           onChange={(e) => setExtrasInput({ ...extrasInput, runs: parseInt(e.target.value) })}
//         />

//         <label>
//           <input
//             type="checkbox"
//             checked={isWicket}
//             onChange={(e) => setIsWicket(e.target.checked)}
//           />{" "}
//           Wicket?
//         </label>

//         {isWicket && (
//           <>
//             <select onChange={(e) => setWicketType(e.target.value)}>
//               <option value="">Select Wicket Type</option>
//               <option value="bowled">Bowled</option>
//               <option value="caught">Caught</option>
//               <option value="lbw">LBW</option>
//               <option value="run out">Run Out</option>
//               <option value="stumped">Stumped</option>
//               <option value="hit wicket">Hit Wicket</option>
//             </select>
//             <select onChange={(e) => setDismissedPlayer(e.target.value)}>
//               <option value="">Select Out Batsman</option>
//               {score.currentBatsmen.map((b) => (
//                 <option key={b.player._id} value={b.player._id}>
//                   {b.player.name}
//                 </option>
//               ))}
//             </select>
//             <select onChange={(e) => setFielder(e.target.value)}>
//               <option value="">Fielder</option>
//               {allPlayers.map((p) => (
//                 <option key={p._id} value={p._id}>
//                   {p.name}
//                 </option>
//               ))}
//             </select>
//           </>
//         )}

//         <input
//           type="text"
//           placeholder="Commentary"
//           value={commentary}
//           onChange={(e) => setCommentary(e.target.value)}
//         />

//         <button onClick={recordBall}>Record Ball</button>
//       </div>

//       {/* ================= Over Management ================= */}
//       <div className={styles.overManagement}>
//         <h3>Change Bowler</h3>
//         <select onChange={(e) => changeBowler(e.target.value)}>
//           <option value="">Select Bowler</option>
//           {allPlayers
//             .filter((p) => p.team === score.bowlingTeam)
//             .map((p) => (
//               <option key={p._id} value={p._id}>
//                 {p.name}
//               </option>
//             ))}
//         </select>
//       </div>

//       {/* ================= Wicket Handling ================= */}
//       {score.wickets > 0 && score.wickets < match.totalWickets && (
//         <div className={styles.wicketManagement}>
//           <h3>Add New Batsman</h3>
//           <select onChange={(e) => addNewBatsman(e.target.value)}>
//             <option value="">Select Batsman</option>
//             {allPlayers
//               .filter(
//                 (p) =>
//                   p.team === score.battingTeam &&
//                   !score.currentBatsmen.some((b) => b.player._id === p._id)
//               )
//               .map((p) => (
//                 <option key={p._id} value={p._id}>
//                   {p.name}
//                 </option>
//               ))}
//           </select>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ScoreHeader from "@/components/ScoreHeader";
import BatsmenPanel from "@/components/BatsmenPanel";
import BowlerPanel from "@/components/BowlerPanel";
import BallFeed from "@/components/BallFeed";
import Controls from "@/components/Controls";
import styles from "@/styles/ScoreUpdate.module.css";
import axios from "axios";

export default function UpdateScorePage() {
  const router = useRouter();
  const { id } = router.query;
  const [score, setScore] = useState(null);
  const [balls, setBalls] = useState([]);

  const fetchScore = async () => {
    if (!id) return;
    const res = await axios.get(`/api/match/${id}/score`);
    setScore(res.data.score);
    setBalls(res.data.score.currentOver.balls || []);
  };
  fetchScore();
  useEffect(() => {
    const interval = setInterval(fetchScore, 5000); // live updates every 5s
    return () => clearInterval(interval);
  }, [id]);

  const handleBallUpdate = async (ballData) => {
    const res = await axios.post(`/api/match/${id}/score/ball`, {
      scoreId: score._id,
      ...ballData,
    });
    setScore(res.data.score);
    setBalls((prev) => [...prev, res.data.ball]);
  };

  if (!score) return <div className={styles.container}>Loading...</div>;

  return (
    <div className={styles.container}>
      <ScoreHeader score={score} />
      <BatsmenPanel batsmen={score.currentBatsmen} />
      <BowlerPanel bowler={score.currentBowler} />
      <BallFeed balls={balls} />
      <Controls score={score} onBallUpdate={handleBallUpdate} />
    </div>
  );
}
