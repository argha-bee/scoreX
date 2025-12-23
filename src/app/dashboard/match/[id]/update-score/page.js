// "use client";
// import { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import styles from "@/styles/UpdateScore.module.css";
// import { useParams } from "next/navigation";

// export default function ScoreUpdatePage() {
//   const { id } = useParams();
//   const [match, setMatch] = useState(null);
//   const [score, setScore] = useState(null);
//   const [allPlayers, setAllPlayers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalMode, setModalMode] = useState(null); // 'striker', 'non-striker', 'bowler'
//   const [isProcessing, setIsProcessing] = useState(false);

//   const fetchData = useCallback(async () => {
//     try {
//       const res = await axios.post(`/api/match/${id}/score-update`);
//       console.log(res.data.allPlayers);
//       if (res.data.success && res.data.data) {
//         setMatch(res.data.data);
//         const currentScore = res.data.data.scores[res.data.data.currentInnings - 1];
//         setScore(currentScore);
//         setAllPlayers(res.data.allPlayers || []);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const selectPlayer = async (playerId, mode) => {
//     const endpoint = mode === "bowler" ? "change-bowler" : "add-batsman";
//     const payload = { playerId, onStrike: mode === "striker" };

//     try {
//       const res = await axios.post(`/api/score/${score._id}/${endpoint}`, payload);
//       if (res.data.success) {
//         setScore(res.data.score);
//         setModalMode(null);
//       }
//     } catch (err) {
//       alert(`Failed to select ${mode}`);
//     }
//   };

//   const handleAction = async (type, value = 0) => {
//     if (isProcessing) return;
//     const striker = score?.currentBatsmen?.find((b) => b.onStrike);
//     const nonStriker = score?.currentBatsmen?.find((b) => !b.onStrike);

//     if (!striker || !nonStriker || !score?.currentBowler) {
//       alert("Select Striker, Non-Striker, and Bowler first!");
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       const payload = {
//         runs: type === "run" ? value : 0,
//         extraType: type === "extra" ? value : null,
//         isWicket: type === "wicket",
//       };
//       const res = await axios.post(`/api/score/${score._id}/ball`, payload);
//       if (res.data.success) {
//         setScore(res.data.score);
//         if (res.data.overEnded) setModalMode("bowler");
//         if (type === "wicket") setModalMode("striker");
//       }
//     } catch (err) {
//       alert("Error recording ball");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (loading) return <div className={styles.loader}>Loading Scorer...</div>;
//   if (!match || !score) return <div className={styles.error}>No Match Data found.</div>;

//   const striker = score.currentBatsmen?.find((b) => b.onStrike);
//   const nonStriker = score.currentBatsmen?.find((b) => !b.onStrike);

//   return (
//     <div className={styles.container}>
//       {/* 1. Header */}
//       <div className={styles.headerCard}>
//         <div className={styles.teamRow}>
//           <span>{match.teams[0]?.shortName}</span>
//           <span className={styles.vs}>vs</span>
//           <span>{match.teams[1]?.shortName}</span>
//         </div>
//         <div className={styles.mainScore}>
//           {score.runs} - {score.wickets}
//         </div>
//         <div className={styles.statsBar}>
//           <span>
//             Overs: {score.overs}.{score.balls}
//           </span>
//           <span>CRR: {score.runRate || "0.00"}</span>
//         </div>
//       </div>

//       {/* 2. Setup Bar */}
//       <div className={styles.setupBar}>
//         <button
//           onClick={() => setModalMode("striker")}
//           className={`${styles.setupBtn} ${!striker ? styles.missing : ""}`}
//         >
//           {striker ? `S: ${striker.player.name}` : "+ Striker"}
//         </button>
//         <button
//           onClick={() => setModalMode("non-striker")}
//           className={`${styles.setupBtn} ${!nonStriker ? styles.missing : ""}`}
//         >
//           {nonStriker ? `NS: ${nonStriker.player.name}` : "+ Non-Striker"}
//         </button>
//         <button
//           onClick={() => setModalMode("bowler")}
//           className={`${styles.setupBtn} ${!score.currentBowler ? styles.missing : ""}`}
//         >
//           {score.currentBowler ? `B: ${score.currentBowler.name}` : "+ Bowler"}
//         </button>
//       </div>

//       {/* 3. Batting Table */}
//       <div className={styles.tableContainer}>
//         <div className={styles.tableHeader}>
//           <span>BATTING</span> <span className={styles.statValue}>R</span>{" "}
//           <span className={styles.statValue}>B</span> <span className={styles.statValue}>4s</span>{" "}
//           <span className={styles.statValue}>6s</span>
//         </div>
//         {score.currentBatsmen.map((b) => (
//           <div
//             key={b.player?._id}
//             className={`${styles.tableRow} ${b.onStrike ? styles.strikerRow : ""}`}
//           >
//             <span>
//               {b.player?.name} {b.onStrike && "★"}
//             </span>
//             <span className={styles.statValue}>{b.runs}</span>
//             <span className={styles.statValue}>{b.balls}</span>
//             <span className={styles.statValue}>{b.player?.battingStats?.fours || 0}</span>
//             <span className={styles.statValue}>{b.player?.battingStats?.sixes || 0}</span>
//           </div>
//         ))}
//       </div>

//       {/* 4. Controls */}
//       <div className={styles.controlPanel}>
//         <div className={styles.buttonGrid}>
//           {[0, 1, 2, 3, 4, 6].map((r) => (
//             <button
//               key={r}
//               className={styles.btn}
//               onClick={() => handleAction("run", r)}
//               disabled={isProcessing}
//             >
//               {r}
//             </button>
//           ))}
//           <button
//             className={`${styles.btn} ${styles.extraBtn}`}
//             onClick={() => handleAction("extra", "WD")}
//           >
//             WD
//           </button>
//           <button
//             className={`${styles.btn} ${styles.extraBtn}`}
//             onClick={() => handleAction("extra", "NB")}
//           >
//             NB
//           </button>
//           <button
//             className={`${styles.btn} ${styles.wicketBtn}`}
//             onClick={() => handleAction("wicket")}
//           >
//             WICKET
//           </button>
//         </div>
//       </div>

//       {/* 5. FIX: Player Selection Modal */}
//       {modalMode && (
//         <div className={styles.overlay}>
//           <div className={styles.modal}>
//             <h3>Select {modalMode}</h3>
//             <div className={styles.playerList}>
//               {allPlayers
//                 .filter((p) => {
//                   // Determine target team based on role
//                   const targetTeamId =
//                     modalMode === "bowler" ? score.bowlingTeam : score.battingTeam;

//                   const playerTeamId = p.team?._id || p.team;
//                   const targetId = targetTeamId?._id || targetTeamId;

//                   return playerTeamId?.toString() === targetId?.toString();
//                 })
//                 .map((p) => (
//                   <button
//                     key={p._id}
//                     className={styles.selectBtn}
//                     onClick={() => selectPlayer(p._id, modalMode)}
//                   >
//                     {p.name} <small>({p.role})</small>
//                   </button>
//                 ))}
//             </div>
//             <button onClick={() => setModalMode(null)} className={styles.closeBtn}>
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "@/styles/UpdateScore.module.css";
import { useParams, useRouter } from "next/navigation";

// --- REUSABLE SCORECARD COMPONENT ---
// const ScorecardTable = ({ title, data, type, activeId }) => (
//   <div className={styles.tableContainer}>
//     <div className={styles.tableHeader}>
//       <span>{title}</span>
//       <span className={styles.statValue}>{type === "bat" ? "R" : "O"}</span>
//       <span className={styles.statValue}>{type === "bat" ? "B" : "W"}</span>
//       <span className={styles.statValue}>{type === "bat" ? "SR" : "Econ"}</span>
//     </div>
//     {data?.map((item) => (
//       <div
//         key={item.player?._id}
//         className={`${styles.tableRow} ${activeId === item.player?._id ? styles.activeRow : ""}`}
//       >
//         <span>
//           {item.player?.name} {type === "bat" && item.onStrike && "★"}
//         </span>
//         <span className={styles.statValue}>
//           {type === "bat" ? item.runs : `${item.overs}.${item.balls}`}
//         </span>
//         <span className={styles.statValue}>{type === "bat" ? item.balls : item.wickets}</span>
//         <span className={styles.statValue}>
//           {type === "bat"
//             ? ((item.runs / item.balls) * 100 || 0).toFixed(1)
//             : (item.runs / ((item.overs * 6 + item.balls) / 6) || 0).toFixed(2)}
//         </span>
//       </div>
//     ))}
//   </div>
// );

const ScorecardTable = ({ title, data, type, activeId }) => (
  <div className={styles.tableContainer}>
    <div className={styles.tableHeader}>
      <span>{title}</span>
      {type === "bat" ? (
        <>
          <span className={styles.statValue}>R</span>
          <span className={styles.statValue}>B</span>
          <span className={styles.statValue}>4s</span>
          <span className={styles.statValue}>6s</span>
          <span className={styles.statValue}>SR</span>
        </>
      ) : (
        <>
          <span className={styles.statValue}>O</span>
          <span className={styles.statValue}>R</span>
          <span className={styles.statValue}>W</span>
          <span className={styles.statValue}>Econ</span>
        </>
      )}
    </div>
    {data?.map((item) => {
      const p = item.player;
      const isOut = p?.battingStats?.isOut;

      return (
        <div
          key={p?._id}
          className={`${styles.tableRow} ${activeId === p?._id ? styles.activeRow : ""}`}
        >
          <div className={styles.playerNameCol}>
            <span className={styles.nameText}>
              {p?.name} {item.onStrike && "★"}
            </span>
            {type === "bat" && (
              <small className={styles.dismissalText}>
                {isOut ? `(b ${p.battingStats.dismissedBy?.name || "bowler"})` : "not out"}
              </small>
            )}
          </div>

          {type === "bat" ? (
            <>
              <span className={styles.statValue}>{item.runs}</span>
              <span className={styles.statValue}>{item.balls}</span>
              <span className={styles.statValue}>{p?.battingStats?.fours || 0}</span>
              <span className={styles.statValue}>{p?.battingStats?.sixes || 0}</span>
              <span className={styles.statValue}>{p?.battingStats?.strikeRate || "0.0"}</span>
            </>
          ) : (
            <>
              <span className={styles.statValue}>
                {item.overs}.{item.balls}
              </span>
              <span className={styles.statValue}>{item.runs}</span>
              <span className={styles.statValue}>{item.wickets}</span>
              <span className={styles.statValue}>
                {(item.runs / ((item.overs * 6 + item.balls) / 6) || 0).toFixed(2)}
              </span>
            </>
          )}
        </div>
      );
    })}
  </div>
);

export default function ScoreUpdatePage() {
  const { id } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Change this in ScoreUpdatePage.jsx
  const fetchData = useCallback(async () => {
    try {
      // Remove the body {matchId: id} because 'id' is already in the URL params
      const res = await axios.post(`/api/match/${id}/score-update`);
      if (res.data.success) {
        setMatch(res.data.data);
        setAllPlayers(res.data.allPlayers || []);
      }
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const score = match?.scores[match.currentInnings - 1];
  const prevInnings = match?.currentInnings === 2 ? match.scores[0] : null;

  // --- ACTIONS ---
  const handleAction = async (type, value = 0) => {
    if (isProcessing) return;
    if (score.isCompleted || match?.state === "finished") {
      alert(`${match.state === "finished" ? "match" : "innings"} is over.`);
      return;
    }

    const striker = score?.currentBatsmen?.find((b) => b.onStrike);
    if (!striker || !score?.currentBowler) return alert("Select Striker and Bowler first!");

    setIsProcessing(true);
    try {
      const res = await axios.post(`/api/score/${score._id}/ball`, {
        runs: type === "run" ? value : 0,
        extraType: type === "extra" ? value : null,
        isWicket: type === "wicket",
      });

      if (res.data.success) {
        if (res.data.inningsFinished) {
          await axios.post(`/api/match/${id}/next-innings`);
          fetchData();
        } else {
          fetchData();
          if (res.data.overEnded) setModalMode("bowler");
          if (type === "wicket") setModalMode("striker");
        }
      }
    } catch (err) {
      alert("Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectPlayer = async (playerId, mode) => {
    const endpoint = mode === "bowler" ? "change-bowler" : "add-batsman";
    try {
      const res = await axios.post(`/api/score/${score._id}/${endpoint}`, {
        playerId,
        onStrike: mode === "striker",
      });
      if (res.data.success) {
        fetchData();
        setModalMode(null);
      }
    } catch (err) {
      alert("Selection failed");
    }
  };

  if (loading || !match || !score)
    return <div className={styles.loader}>Loading Live Match...</div>;

  // --- CALCULATIONS ---
  const crr = (score.runs / ((score.overs * 6 + score.balls) / 6) || 0).toFixed(2);
  // const target = prevInnings ? prevInnings.runs + 1 : null;
  const remainingBalls = match.overs * 6 - (score.overs * 6 + score.balls);
  // const rrr = target ? ((target - score.runs) / (remainingBalls / 6) || 0).toFixed(2) : null;

  // Calculations for 2nd Innings
  const target = prevInnings ? prevInnings.runs + 1 : null;
  const totalBalls = (match?.overs || 0) * 6;
  const ballsDone = (score?.overs || 0) * 6 + (score?.balls || 0);
  const ballsLeft = totalBalls - ballsDone;
  const rrr = target ? (((target - score.runs) / ballsLeft) * 6).toFixed(2) : null;
  const isControlDisabled = score.isCompleted || match.state === "finished";

  return (
    <div className={styles.container}>
      {/* 1. BIG SCOREBOARD HEADER */}
      <div className={styles.headerCard}>
        <div className={styles.inningsLabel}>
          {match.currentInnings === 1 ? "FIRST INNINGS" : "SECOND INNINGS"}
        </div>
        <div className={styles.teamRow}>
          <span>{match.teams[0]?.shortName}</span>
          <span className={styles.vs}>vs</span>
          <span>{match.teams[1]?.shortName}</span>
        </div>
        <div className={styles.mainScore}>
          {score.runs} - {score.wickets}
          <small className={styles.oversText}>
            {" "}
            ({score.overs}.{score.balls})
          </small>
        </div>
        {target && (
          <div className={styles.targetInfo}>
            TARGET: {target} | Need {target - score.runs} from {remainingBalls} balls
          </div>
        )}
        <div className={styles.statsBar}>
          <span>CRR: {crr}</span>
          {rrr && <span>RRR: {rrr}</span>}
        </div>
      </div>

      {/* 2. OVER TIMELINE & BOWLER STATS */}
      <div className={styles.bowlerStatusCard}>
        <div className={styles.bowlerFlex}>
          <div className={styles.bowlerIdentity}>
            <strong>{score.currentBowler?.name || "No Bowler"}</strong>
            <small>Economy: {score.currentBowler?.bowlingStats?.economy || "0.00"}</small>
          </div>
          <div className={styles.bowlerMatchStats}>
            {score.currentBowler?.bowlingStats?.overs || 0}-
            {score.currentBowler?.bowlingStats?.maidens || 0}-
            {score.currentBowler?.bowlingStats?.runs || 0}-
            {score.currentBowler?.bowlingStats?.wickets || 0}
          </div>
        </div>
        <div className={styles.timelineList}>
          {score.scoreEveryBall?.slice(-6).map((ball, i) => (
            <span key={i} className={styles.ballCircle}>
              {ball}
            </span>
          ))}
        </div>
      </div>

      {/* 3. SETUP CONTROLS */}
      <div className={styles.setupBar}>
        <button onClick={() => setModalMode("striker")} className={styles.setupBtn}>
          + Striker
        </button>
        <button onClick={() => setModalMode("non-striker")} className={styles.setupBtn}>
          + Non-Striker
        </button>
        <button onClick={() => setModalMode("bowler")} className={styles.setupBtn}>
          + Bowler
        </button>
      </div>

      {/* 4. LIVE BATTING TABLE */}
      <ScorecardTable
        title="LIVE BATTING"
        data={score.currentBatsmen}
        type="bat"
        activeId={score.currentBatsmen.find((b) => b.onStrike)?.player?._id}
      />

      {/* 5. LIVE BOWLING TABLE */}
      <ScorecardTable
        title="LIVE BOWLING"
        data={score.bowlersPerformance}
        type="bowl"
        activeId={score.currentBowler?._id}
      />

      {/* 6. CONTROL PANEL */}
      {!isControlDisabled ? (
        <div className={styles.controlPanel}>
          <div className={styles.buttonGrid}>
            {[0, 1, 2, 3, 4, 6].map((r) => (
              <button key={r} onClick={() => handleAction("run", r)} className={styles.btn}>
                {r}
              </button>
            ))}
            <button onClick={() => handleAction("extra", "WD")} className={styles.extraBtn}>
              WD
            </button>
            <button onClick={() => handleAction("extra", "NB")} className={styles.extraBtn}>
              NB
            </button>
            <button onClick={() => handleAction("wicket")} className={styles.wicketBtn}>
              WICKET
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.postGameActions}>
          {match.currentInnings === 1 ? (
            <button onClick={handleStartSecondInnings}>Start 2nd Innings</button>
          ) : (
            <button onClick={() => router.push("/matches")}>Match Summary</button>
          )}
        </div>
      )}

      {/* 7. PREVIOUS INNINGS PUSHED TO BOTTOM */}
      {prevInnings && (
        <div className={styles.historySection}>
          <div className={styles.divider}>COMPLETED: FIRST INNINGS</div>
          <div className={styles.summaryLine}>
            Total: {prevInnings.runs}/{prevInnings.wickets} ({prevInnings.overs} ov)
          </div>
          <ScorecardTable
            title="1st Innings Batting"
            data={prevInnings.currentBatsmen}
            type="bat"
          />
        </div>
      )}

      {/* 8. SELECTION MODAL */}
      {modalMode && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Select {modalMode}</h3>
            <div className={styles.playerList}>
              {allPlayers
                .filter((p) => {
                  const targetTeamId =
                    modalMode === "bowler" ? score.bowlingTeam : score.battingTeam;
                  const playerTeamId = p.team?._id || p.team;
                  const targetId = targetTeamId?._id || targetTeamId;
                  const isWK = p.role?.toLowerCase().includes("keeper") || p.role === "WK";
                  if (modalMode === "bowler" && isWK) return false;
                  return playerTeamId?.toString() === targetId?.toString();
                })
                .map((p) => (
                  <button
                    key={p._id}
                    className={styles.selectBtn}
                    onClick={() => selectPlayer(p._id, modalMode)}
                  >
                    {p.name} <small>({p.role})</small>
                  </button>
                ))}
            </div>
            <button onClick={() => setModalMode(null)} className={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Match finish logic */}
      {match.status === "finished" && (
        <div className={styles.winnerOverlay}>
          <div className={styles.winnerCard}>
            <h1>MATCH FINISHED</h1>
            <h2>
              {match.winner === "Tie" ? "It's a Tie!" : `${match.winner?.name} won the match!`}
            </h2>
            <button onClick={() => router.push(`/match/${match._id}`)}>View Summary</button>
          </div>
        </div>
      )}
    </div>
  );
}
