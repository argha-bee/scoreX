// "use client";
// import { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import styles from "@/styles/UpdateScore.module.css";
// import { useParams, useRouter } from "next/navigation";
// const ScorecardTable = ({ title, data, type, activeId }) => (
//   <div className={styles.tableContainer}>
//     <div className={styles.tableHeader}>
//       <span>{title}</span>
//       {type === "bat" ? (
//         <>
//           <span className={styles.statValue}>R</span>
//           <span className={styles.statValue}>B</span>
//           <span className={styles.statValue}>4s</span>
//           <span className={styles.statValue}>6s</span>
//           <span className={styles.statValue}>SR</span>
//         </>
//       ) : (
//         <>
//           <span className={styles.statValue}>O</span>
//           <span className={styles.statValue}>R</span>
//           <span className={styles.statValue}>W</span>
//           <span className={styles.statValue}>Econ</span>
//         </>
//       )}
//     </div>
//     {data?.map((item) => {
//       const p = item.player;
//       const isOut = p?.battingStats?.isOut;

//       return (
//         <div
//           key={p?._id}
//           className={`${styles.tableRow} ${activeId === p?._id ? styles.activeRow : ""}`}
//         >
//           <div className={styles.playerNameCol}>
//             <span className={styles.nameText}>
//               {p?.name} {item.onStrike && "★"}
//             </span>
//             {type === "bat" && (
//               <small className={styles.dismissalText}>
//                 {isOut ? `(b ${p.battingStats.dismissedBy?.name || "bowler"})` : "not out"}
//               </small>
//             )}
//           </div>

//           {type === "bat" ? (
//             <>
//               <span className={styles.statValue}>{item.runs}</span>
//               <span className={styles.statValue}>{item.balls}</span>
//               <span className={styles.statValue}>{p?.battingStats?.fours || 0}</span>
//               <span className={styles.statValue}>{p?.battingStats?.sixes || 0}</span>
//               <span className={styles.statValue}>{p?.battingStats?.strikeRate || "0.0"}</span>
//             </>
//           ) : (
//             <>
//               <span className={styles.statValue}>
//                 {item.overs}.{item.balls}
//               </span>
//               <span className={styles.statValue}>{item.runs}</span>
//               <span className={styles.statValue}>{item.wickets}</span>
//               <span className={styles.statValue}>
//                 {(item.runs / ((item.overs * 6 + item.balls) / 6) || 0).toFixed(2)}
//               </span>
//             </>
//           )}
//         </div>
//       );
//     })}
//   </div>
// );

// export default function ScoreUpdatePage() {
//   const { id } = useParams();
//   const router = useRouter();
//   const [match, setMatch] = useState(null);
//   const [allPlayers, setAllPlayers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalMode, setModalMode] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Change this in ScoreUpdatePage.jsx
//   const fetchData = useCallback(async () => {
//     try {
//       // Remove the body {matchId: id} because 'id' is already in the URL params
//       const res = await axios.post(`/api/match/${id}/score-update`);
//       if (res.data.success) {
//         setMatch(res.data.data);
//         setAllPlayers(res.data.allPlayers || []);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const score = match?.scores[match.currentInnings - 1];
//   const prevInnings = match?.currentInnings === 2 ? match.scores[0] : null;

//   // --- ACTIONS ---
//   const handleAction = async (type, value = 0) => {
//     if (isProcessing) return;
//     if (score.isCompleted || match?.state === "finished") {
//       alert(`${match.state === "finished" ? "match" : "innings"} is over.`);
//       return;
//     }

//     const striker = score?.currentBatsmen?.find((b) => b.onStrike);
//     if (!striker || !score?.currentBowler) return alert("Select Striker and Bowler first!");

//     setIsProcessing(true);
//     try {
//       const res = await axios.post(`/api/score/${score._id}/ball`, {
//         runs: type === "run" ? value : 0,
//         extraType: type === "extra" ? value : null,
//         isWicket: type === "wicket",
//       });

//       if (res.data.success) {
//         if (res.data.inningsFinished) {
//           await axios.post(`/api/match/${id}/next-innings`);
//           fetchData();
//         } else {
//           fetchData();
//           if (res.data.overEnded) setModalMode("bowler");
//           if (type === "wicket") setModalMode("striker");
//         }
//       }
//     } catch (err) {
//       alert("Action failed");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const selectPlayer = async (playerId, mode) => {
//     const endpoint = mode === "bowler" ? "change-bowler" : "add-batsman";
//     try {
//       const res = await axios.post(`/api/score/${score._id}/${endpoint}`, {
//         playerId,
//         onStrike: mode === "striker",
//       });
//       if (res.data.success) {
//         fetchData();
//         setModalMode(null);
//       }
//     } catch (err) {
//       alert("Selection failed");
//     }
//   };

//   if (loading || !match || !score)
//     return <div className={styles.loader}>Loading Live Match...</div>;

//   // --- CALCULATIONS ---
//   const crr = (score.runs / ((score.overs * 6 + score.balls) / 6) || 0).toFixed(2);
//   // const target = prevInnings ? prevInnings.runs + 1 : null;
//   const remainingBalls = match.overs * 6 - (score.overs * 6 + score.balls);
//   // const rrr = target ? ((target - score.runs) / (remainingBalls / 6) || 0).toFixed(2) : null;

//   // Calculations for 2nd Innings
//   const target = prevInnings ? prevInnings.runs + 1 : null;
//   const totalBalls = (match?.overs || 0) * 6;
//   const ballsDone = (score?.overs || 0) * 6 + (score?.balls || 0);
//   const ballsLeft = totalBalls - ballsDone;
//   const rrr = target ? (((target - score.runs) / ballsLeft) * 6).toFixed(2) : null;
//   const isControlDisabled = score.isCompleted || match.state === "finished";

//   return (
//     <div className={styles.container}>
//       {/* 1. BIG SCOREBOARD HEADER */}
//       <div className={styles.headerCard}>
//         <div className={styles.inningsLabel}>
//           {match.currentInnings === 1 ? "FIRST INNINGS" : "SECOND INNINGS"}
//         </div>
//         <div className={styles.teamRow}>
//           <span>{match.teams[0]?.shortName}</span>
//           <span className={styles.vs}>vs</span>
//           <span>{match.teams[1]?.shortName}</span>
//         </div>
//         <div className={styles.mainScore}>
//           {score.runs} - {score.wickets}
//           <small className={styles.oversText}>
//             {" "}
//             ({score.overs}.{score.balls})
//           </small>
//         </div>
//         {target && (
//           <div className={styles.targetInfo}>
//             TARGET: {target} | Need {target - score.runs} from {remainingBalls} balls
//           </div>
//         )}
//         <div className={styles.statsBar}>
//           <span>CRR: {crr}</span>
//           {rrr && <span>RRR: {rrr}</span>}
//         </div>
//       </div>

//       {/* 2. OVER TIMELINE & BOWLER STATS */}
//       <div className={styles.bowlerStatusCard}>
//         <div className={styles.bowlerFlex}>
//           <div className={styles.bowlerIdentity}>
//             <strong>{score.currentBowler?.name || "No Bowler"}</strong>
//             <small>Economy: {score.currentBowler?.bowlingStats?.economy || "0.00"}</small>
//           </div>
//           <div className={styles.bowlerMatchStats}>
//             {score.currentBowler?.bowlingStats?.overs || 0}-
//             {score.currentBowler?.bowlingStats?.maidens || 0}-
//             {score.currentBowler?.bowlingStats?.runs || 0}-
//             {score.currentBowler?.bowlingStats?.wickets || 0}
//           </div>
//         </div>
//         <div className={styles.timelineList}>
//           {score.scoreEveryBall?.slice(-6).map((ball, i) => (
//             <span key={i} className={styles.ballCircle}>
//               {ball}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* 3. SETUP CONTROLS */}
//       <div className={styles.setupBar}>
//         <button onClick={() => setModalMode("striker")} className={styles.setupBtn}>
//           + Striker
//         </button>
//         <button onClick={() => setModalMode("non-striker")} className={styles.setupBtn}>
//           + Non-Striker
//         </button>
//         <button onClick={() => setModalMode("bowler")} className={styles.setupBtn}>
//           + Bowler
//         </button>
//       </div>

//       {/* 4. LIVE BATTING TABLE */}
//       <ScorecardTable
//         title="LIVE BATTING"
//         data={score.currentBatsmen}
//         type="bat"
//         activeId={score.currentBatsmen.find((b) => b.onStrike)?.player?._id}
//       />

//       {/* 5. LIVE BOWLING TABLE */}
//       <ScorecardTable
//         title="LIVE BOWLING"
//         data={score.bowlersPerformance}
//         type="bowl"
//         activeId={score.currentBowler?._id}
//       />

//       {/* 6. CONTROL PANEL */}
//       {!isControlDisabled ? (
//         <div className={styles.controlPanel}>
//           <div className={styles.buttonGrid}>
//             {[0, 1, 2, 3, 4, 6].map((r) => (
//               <button key={r} onClick={() => handleAction("run", r)} className={styles.btn}>
//                 {r}
//               </button>
//             ))}
//             <button onClick={() => handleAction("extra", "WD")} className={styles.extraBtn}>
//               WD
//             </button>
//             <button onClick={() => handleAction("extra", "NB")} className={styles.extraBtn}>
//               NB
//             </button>
//             <button onClick={() => handleAction("wicket")} className={styles.wicketBtn}>
//               WICKET
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className={styles.postGameActions}>
//           {match.currentInnings === 1 ? (
//             <button onClick={handleStartSecondInnings}>Start 2nd Innings</button>
//           ) : (
//             <button onClick={() => router.push("/matches")}>Match Summary</button>
//           )}
//         </div>
//       )}

//       {/* 7. PREVIOUS INNINGS PUSHED TO BOTTOM */}
//       {prevInnings && (
//         <div className={styles.historySection}>
//           <div className={styles.divider}>COMPLETED: FIRST INNINGS</div>
//           <div className={styles.summaryLine}>
//             Total: {prevInnings.runs}/{prevInnings.wickets} ({prevInnings.overs} ov)
//           </div>
//           <ScorecardTable
//             title="1st Innings Batting"
//             data={prevInnings.currentBatsmen}
//             type="bat"
//           />
//         </div>
//       )}

//       {/* 8. SELECTION MODAL */}
//       {modalMode && (
//         <div className={styles.overlay}>
//           <div className={styles.modal}>
//             <h3>Select {modalMode}</h3>
//             <div className={styles.playerList}>
//               {allPlayers
//                 .filter((p) => {
//                   const targetTeamId =
//                     modalMode === "bowler" ? score.bowlingTeam : score.battingTeam;
//                   const playerTeamId = p.team?._id || p.team;
//                   const targetId = targetTeamId?._id || targetTeamId;
//                   const isWK = p.role?.toLowerCase().includes("keeper") || p.role === "WK";
//                   if (modalMode === "bowler" && isWK) return false;
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

//       {/* Match finish logic */}
//       {match.status === "finished" && (
//         <div className={styles.winnerOverlay}>
//           <div className={styles.winnerCard}>
//             <h1>MATCH FINISHED</h1>
//             <h2>
//               {match.winner === "Tie" ? "It's a Tie!" : `${match.winner?.name} won the match!`}
//             </h2>
//             <button onClick={() => router.push(`/match/${match._id}`)}>View Summary</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /dashboard/match/[id]/update-score/page.js - FIXED
"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "@/styles/UpdateScore.module.css";
import { useParams, useRouter } from "next/navigation";
import ScorecardTable from "@/components/ScorecardTable";
import PlayerSelectionModal from "@/components/PlayerSelectionModal";

export default function ScoreUpdatePage() {
  const { id } = useParams();
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wicketDetails, setWicketDetails] = useState({ type: "bowled", fielderId: null });

  const fetchData = useCallback(async () => {
    try {
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

  if (loading || !match) {
    return <div className={styles.loader}>Loading Live Match...</div>;
  }

  const score = match.scores[match.currentInnings - 1];
  const prevInnings = match.currentInnings === 2 ? match.scores[0] : null;

  if (!score) {
    return <div className={styles.center}>Score data not available</div>;
  }

  // Check if match/innings is finished
  const isControlDisabled = score.isCompleted || match.state === "finished";

  // Calculations
  const crr = (score.runs / ((score.overs * 6 + score.balls) / 6) || 0).toFixed(2);
  const target = prevInnings ? prevInnings.runs + 1 : null;
  const totalBalls = (match?.overs || 0) * 6;
  const ballsDone = (score?.overs || 0) * 6 + (score?.balls || 0);
  const ballsLeft = totalBalls - ballsDone;
  const rrr = target && ballsLeft > 0 ? (((target - score.runs) / ballsLeft) * 6).toFixed(2) : null;

  // Handle ball action
  const handleAction = async (type, value = 0) => {
    if (isProcessing || isControlDisabled) return;

    const striker = score?.currentBatsmen?.find((b) => b.onStrike);
    if (!striker || !score?.currentBowler) {
      return alert("Select Striker and Bowler first!");
    }

    // For wickets, show modal for details
    if (type === "wicket") {
      setModalMode("wicket");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await axios.post(`/api/score/${score._id}/ball`, {
        runs: type === "run" ? value : 0,
        extraType: type === "extra" ? value : null,
        isWicket: false,
      });

      if (res.data.success) {
        await fetchData();

        if (res.data.inningsFinished) {
          if (match.currentInnings === 1) {
            // Start 2nd innings
            await axios.post(`/api/match/${id}/next-innings`);
            await fetchData();
          } else {
            // Match finished
            alert(`Match Finished! ${match.winningMargin || ""}`);
            router.push(`/dashboard/match/${id}/summary`);
          }
        } else if (res.data.overEnded) {
          setModalMode("bowler");
        }
      }
    } catch (err) {
      console.error("Action error:", err);
      alert(err.response?.data?.error || "Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle wicket confirmation
  const handleWicketConfirm = async () => {
    setIsProcessing(true);
    try {
      const res = await axios.post(`/api/score/${score._id}/ball`, {
        runs: 0,
        extraType: null,
        isWicket: true,
        wicketType: wicketDetails.type,
        fielderId: wicketDetails.fielderId,
      });

      if (res.data.success) {
        setModalMode(null);
        setWicketDetails({ type: "bowled", fielderId: null });
        await fetchData();

        if (res.data.inningsFinished || res.data.matchFinished) {
          if (match.currentInnings === 1) {
            await axios.post(`/api/match/${id}/next-innings`);
          }
          await fetchData();
        } else {
          // Need new batsman
          setModalMode("striker");
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to record wicket");
    } finally {
      setIsProcessing(false);
    }
  };

  // Select player (batsman or bowler)
  const selectPlayer = async (playerId, mode) => {
    const endpoint = mode === "bowler" ? "change-bowler" : "add-batsman";
    try {
      const res = await axios.post(`/api/score/${score._id}/${endpoint}`, {
        playerId,
        onStrike: mode === "striker",
      });

      if (res.data.success) {
        await fetchData();
        setModalMode(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Selection failed");
    }
  };

  // Filter players based on modal mode and innings
  const getFilteredPlayers = () => {
    if (!modalMode || modalMode === "wicket") return [];

    const targetTeamId =
      modalMode === "bowler"
        ? score.bowlingTeam?._id || score.bowlingTeam
        : score.battingTeam?._id || score.battingTeam;

    return allPlayers.filter((p) => {
      const playerTeamId = p.team?._id || p.team;
      const matchesTeam = playerTeamId?.toString() === targetTeamId?.toString();

      if (!matchesTeam) return false;

      // Additional filters
      if (modalMode === "bowler") {
        // Can't bowl if wicket-keeper (optional rule)
        const isWK = p.role?.toLowerCase().includes("keeper");
        return !isWK;
      } else {
        // Batting: exclude already out players
        const isAlreadyOut = p.battingStats?.isOut;
        const isCurrentlyBatting = score.currentBatsmen?.some(
          (b) => b.player?._id?.toString() === p._id.toString()
        );
        return !isAlreadyOut && !isCurrentlyBatting;
      }
    });
  };

  // Handle start 2nd innings
  const handleStartSecondInnings = async () => {
    try {
      const res = await axios.post(`/api/match/${id}/next-innings`);
      if (res.data.success) {
        await fetchData();
      }
    } catch (err) {
      alert("Failed to start 2nd innings");
    }
  };

  return (
    <div className={styles.container}>
      {/* Big Scoreboard */}
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
            ({score.overs}.{score.balls})
          </small>
        </div>
        {target && (
          <div className={styles.targetInfo}>
            TARGET: {target} | Need {Math.max(0, target - score.runs)} from {ballsLeft} balls
          </div>
        )}
        <div className={styles.statsBar}>
          <span>CRR: {crr}</span>
          {rrr && <span>RRR: {rrr}</span>}
        </div>
      </div>

      {/* Bowler Status & Timeline */}
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
          {score.scoreEveryBall?.slice(-12).map((ball, i) => (
            <span key={i} className={styles.ballCircle}>
              {ball}
            </span>
          ))}
        </div>
      </div>

      {/* Setup Controls */}
      {!isControlDisabled && (
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
      )}

      {/* Live Batting */}
      <ScorecardTable
        title="LIVE BATTING"
        data={score.currentBatsmen}
        type="bat"
        activeId={score.currentBatsmen?.find((b) => b.onStrike)?.player?._id}
      />

      {/* Live Bowling */}
      <ScorecardTable
        title="LIVE BOWLING"
        data={score.bowlersPerformance}
        type="bowl"
        activeId={score.currentBowler?._id}
      />

      {/* Control Panel */}
      {!isControlDisabled && (
        <div className={styles.controlPanel}>
          <div className={styles.buttonGrid}>
            {[0, 1, 2, 3, 4, 6].map((r) => (
              <button
                key={r}
                onClick={() => handleAction("run", r)}
                className={styles.btn}
                disabled={isProcessing}
              >
                {r}
              </button>
            ))}
            <button
              onClick={() => handleAction("extra", "WD")}
              className={styles.extraBtn}
              disabled={isProcessing}
            >
              WD
            </button>
            <button
              onClick={() => handleAction("extra", "NB")}
              className={styles.extraBtn}
              disabled={isProcessing}
            >
              NB
            </button>
            <button
              onClick={() => handleAction("wicket")}
              className={styles.wicketBtn}
              disabled={isProcessing}
            >
              WICKET
            </button>
          </div>
        </div>
      )}

      {/* Post-game Actions */}
      {isControlDisabled && (
        <div className={styles.postGameActions}>
          {match.currentInnings === 1 && !match.scores[1] ? (
            <button onClick={handleStartSecondInnings} className={styles.primaryBtn}>
              Start 2nd Innings
            </button>
          ) : (
            <button
              onClick={() => router.push(`/dashboard/match/${id}/summary`)}
              className={styles.primaryBtn}
            >
              View Match Summary
            </button>
          )}
        </div>
      )}

      {/* Previous Innings Summary */}
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

      {/* Player Selection Modal */}
      {modalMode && modalMode !== "wicket" && (
        <PlayerSelectionModal
          title={`Select ${modalMode}`}
          players={getFilteredPlayers()}
          onSelect={(playerId) => selectPlayer(playerId, modalMode)}
          onClose={() => setModalMode(null)}
        />
      )}

      {/* Wicket Details Modal */}
      {modalMode === "wicket" && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Wicket Details</h3>
            <label>
              Dismissal Type:
              <select
                value={wicketDetails.type}
                onChange={(e) => setWicketDetails({ ...wicketDetails, type: e.target.value })}
              >
                <option value="bowled">Bowled</option>
                <option value="caught">Caught</option>
                <option value="lbw">LBW</option>
                <option value="run out">Run Out</option>
                <option value="stumped">Stumped</option>
                <option value="hit wicket">Hit Wicket</option>
              </select>
            </label>

            {(wicketDetails.type === "caught" || wicketDetails.type === "stumped") && (
              <label>
                Fielder:
                <select
                  value={wicketDetails.fielderId || ""}
                  onChange={(e) =>
                    setWicketDetails({ ...wicketDetails, fielderId: e.target.value })
                  }
                >
                  <option value="">Select Fielder</option>
                  {allPlayers
                    .filter((p) => {
                      const bowlingTeamId = score.bowlingTeam?._id || score.bowlingTeam;
                      const playerTeamId = p.team?._id || p.team;
                      return playerTeamId?.toString() === bowlingTeamId?.toString();
                    })
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
            )}

            <div className={styles.modalActions}>
              <button onClick={handleWicketConfirm} disabled={isProcessing}>
                Confirm
              </button>
              <button onClick={() => setModalMode(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
