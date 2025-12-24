
"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "@/styles/UpdateScore.module.css";
import { useParams, useRouter } from "next/navigation";
import ScorecardTable from "@/components/ScorecardTable";
import PlayerSelectionModal from "@/components/PlayerSelectionModal";
import Swal from "sweetalert2";

export default function ScoreUpdatePage() {
  const { id } = useParams();
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [score, setScore] = useState(null);
  const [prevInnings, setPrevInnings] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wicketDetails, setWicketDetails] = useState({ type: "bowled", fielderId: null });
  const [extraRuns, setExtraRuns] = useState(0);
  const [extraType, setExtraType] = useState("WD");

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.post(`/api/match/${id}/score-update`);
      if (res.data.success) {
        const matchData = res.data.data;
        setMatch(matchData);
        setAllPlayers(res.data.allPlayers || []);

        // Set current score
        const currentScore = matchData.scores[matchData.currentInnings - 1];
        setScore(currentScore);

        // Set previous innings if exists
        const previous = matchData.currentInnings === 2 ? matchData.scores[0] : null;
        setPrevInnings(previous);
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

  if (loading) {
    return <div className={styles.loader}>Loading Live Match...</div>;
  }

  if (!match || !score) {
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

  // Get batting team name
  const battingTeamId = score.battingTeam?._id || score.battingTeam;
  const battingTeam = match.teams.find(
    (t) => (t._id || t).toString() === battingTeamId?.toString()
  );
  const battingTeamName = battingTeam?.shortName || "Team";

  // Handle ball action
  const handleAction = async (type, value = 0) => {
    if (isProcessing || isControlDisabled) return;

    const striker = score?.currentBatsmen?.find((b) => b.onStrike);
    if (!striker || !score?.currentBowler) {
      return Swal.fire("Error", "Select Striker and Bowler first!", "error");
    }

    // For wickets, show modal for details
    if (type === "wicket") {
      setModalMode("wicket");
      return;
    }

    // For extras with runs, show input
    if (type === "extra" && (value === "WD" || value === "NB")) {
      setModalMode("extraRuns");
      setExtraType(value);
      setExtraRuns(0);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await axios.post(`/api/score/${score._id}/ball`, {
        runs: type === "run" ? value : 0,
        extraType: type === "extra" ? value : null,
        extraRuns: 0,
        isWicket: false,
      });

      if (res.data.success) {
        await fetchData();

        if (res.data.inningsFinished) {
          if (match.currentInnings === 1) {
            Swal.fire({
              title: "Innings Complete!",
              text: "First innings finished!",
              icon: "success",
              confirmButtonText: "OK",
            });
          } else {
            Swal.fire({
              title: "Match Finished!",
              text: res.data.winningMargin || "Match completed",
              icon: "success",
              confirmButtonText: "View Summary",
            }).then(() => {
              router.push(`/dashboard/match/${id}/summary`);
            });
          }
        } else if (res.data.overEnded) {
          setModalMode("bowler");
        }
      }
    } catch (err) {
      console.error("Action error:", err);
      Swal.fire("Error", err.response?.data?.error || "Action failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle extra with runs
  const handleExtraWithRuns = async () => {
    setIsProcessing(true);
    try {
      const res = await axios.post(`/api/score/${score._id}/ball`, {
        runs: 0,
        extraType: extraType,
        extraRuns: extraRuns,
        isWicket: false,
      });

      if (res.data.success) {
        setModalMode(null);
        setExtraRuns(0);
        await fetchData();

        if (res.data.inningsFinished) {
          if (match.currentInnings === 1) {
            Swal.fire("Innings Complete", "First innings finished!", "success");
          } else {
            Swal.fire("Match Finished!", match.winningMargin || "", "success");
          }
        } else if (res.data.overEnded) {
          setModalMode("bowler");
        }
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed", "error");
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
        extraRuns: 0,
        isWicket: true,
        wicketType: wicketDetails.type,
        fielderId: wicketDetails.fielderId,
      });

      if (res.data.success) {
        setModalMode(null);
        setWicketDetails({ type: "bowled", fielderId: null });
        await fetchData();

        if (res.data.inningsFinished) {
          if (match.currentInnings === 1) {
            Swal.fire("Innings Complete", "All wickets down!", "success");
          } else {
            Swal.fire("Match Finished!", match.winningMargin || "", "success");
          }
        } else {
          // Need new batsman
          setModalMode("striker");
        }
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to record wicket", "error");
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
      Swal.fire("Error", err.response?.data?.error || "Selection failed", "error");
    }
  };

  // Filter players based on modal mode and innings
  const getFilteredPlayers = () => {
    if (!modalMode || modalMode === "wicket" || modalMode === "extraRuns") return [];

    const targetTeamId =
      modalMode === "bowler"
        ? score.bowlingTeam?._id || score.bowlingTeam
        : score.battingTeam?._id || score.battingTeam;

    return allPlayers.filter((p) => {
      const playerTeamId = p.team?._id || p.team;
      const matchesTeam = playerTeamId?.toString() === targetTeamId?.toString();

      if (!matchesTeam) return false;

      if (modalMode === "bowler") {
        const isWK = p.role?.toLowerCase().includes("keeper");
        return !isWK;
      } else {
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
        Swal.fire("Success", "Second innings started!", "success");
        await fetchData();
      }
    } catch (err) {
      Swal.fire("Error", "Failed to start 2nd innings", "error");
    }
  };

  // Get current bowler from bowlersPerformance
  const currentBowler = score.bowlersPerformance?.find(
    (b) => b.player?.toString() === score.currentBowler?._id?.toString()
  );

  const currentBowlerName = score.currentBowler?.name || "No Bowler";
  const currentBowlerEcon = currentBowler
    ? (currentBowler.runs / ((currentBowler.overs * 6 + currentBowler.balls) / 6) || 0).toFixed(2)
    : "0.00";

  return (
    <div className={styles.container}>
      {/* Big Scoreboard */}
      <div className={styles.headerCard}>
        <div className={styles.inningsLabel}>
          {match.currentInnings === 1 ? "FIRST INNINGS" : "SECOND INNINGS"}
        </div>
        <div className={styles.teamRow}>
          <span>{match.teams[0]?.shortName}</span>
          <span className={styles.vs}> vs </span>
          <span>{match.teams[1]?.shortName}</span>
        </div>
        <div className={styles.battingTeamName}>{battingTeamName}</div>
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

      {/* Bowler Status & Ball Timeline */}
      <div className={styles.bowlerStatusCard}>
        <div className={styles.bowlerFlex}>
          <div className={styles.bowlerIdentity}>
            <strong>Timeline</strong>
            {/* <strong>{currentBowlerName}</strong> */}
            {/* <small>Economy: {currentBowlerEcon}</small> */}
          </div>
          {/* <div className={styles.bowlerMatchStats}>
            {currentBowler?.overs || 0}.{currentBowler?.balls || 0} - {currentBowler?.runs || 0} -{" "}
            {currentBowler?.wickets || 0}
          </div> */}
        </div>
        <div className={styles.ballTimeline}>
          {score.scoreEveryBall?.slice(-15).map((ball, i) => {
            const isWicket = ball === "W" || ball.includes("W");
            const isFour = ball === "4";
            const isSix = ball === "6";

            return (
              <span
                key={i}
                className={`${styles.ballCircle} ${
                  isWicket
                    ? styles.wicketBall
                    : isFour
                    ? styles.fourBall
                    : isSix
                    ? styles.sixBall
                    : ""
                }`}
              >
                {ball}
              </span>
            );
          })}
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
          {match.currentInnings === 1 && match.state !== "finished" ? (
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
      {modalMode && !["wicket", "extraRuns"].includes(modalMode) && (
        <PlayerSelectionModal
          title={`Select ${modalMode}`}
          players={getFilteredPlayers()}
          onSelect={(playerId) => selectPlayer(playerId, modalMode)}
          onClose={() => setModalMode(null)}
        />
      )}

      {/* Extra Runs Modal */}
      {modalMode === "extraRuns" && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Extra Runs ({extraType})</h3>
            <p>How many runs off the {extraType === "WD" ? "wide" : "no-ball"}?</p>
            <div className={styles.extraRunsButtons}>
              {[0, 1, 2, 3, 4, 6].map((r) => (
                <button
                  key={r}
                  onClick={() => setExtraRuns(r)}
                  className={`${styles.extraRunBtn} ${extraRuns === r ? styles.selected : ""}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleExtraWithRuns} disabled={isProcessing}>
                Confirm
              </button>
              <button onClick={() => setModalMode(null)}>Cancel</button>
            </div>
          </div>
        </div>
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
