// /dashboard/match/[id]/live-score/page.js
"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import styles from "@/styles/LiveScore.module.css";
import ScorecardTable from "@/components/ScorecardTable";

export default function LiveScorePage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.post(`/api/match/${id}/score-update`);
      if (res.data.success) {
        setMatch(res.data.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading) {
    return <div className={styles.loader}>Loading Live Score...</div>;
  }

  if (!match) {
    return <div className={styles.error}>Match not found</div>;
  }

  const currentScore = match.scores[match.currentInnings - 1];
  const prevInnings = match.currentInnings === 2 ? match.scores[0] : null;

  if (!currentScore) {
    return <div className={styles.error}>No score data available</div>;
  }

  // Calculations
  const crr = (
    currentScore.runs / ((currentScore.overs * 6 + currentScore.balls) / 6) || 0
  ).toFixed(2);
  const target = prevInnings ? prevInnings.runs + 1 : null;
  const totalBalls = (match?.overs || 0) * 6;
  const ballsDone = (currentScore?.overs || 0) * 6 + (currentScore?.balls || 0);
  const ballsLeft = totalBalls - ballsDone;
  const rrr =
    target && ballsLeft > 0 ? (((target - currentScore.runs) / ballsLeft) * 6).toFixed(2) : null;

  // Get team names
  const battingTeamName =
    match.teams.find(
      (t) =>
        t._id?.toString() ===
        (currentScore.battingTeam?._id || currentScore.battingTeam)?.toString()
    )?.name || "Batting Team";

  const bowlingTeamName =
    match.teams.find(
      (t) =>
        t._id?.toString() ===
        (currentScore.bowlingTeam?._id || currentScore.bowlingTeam)?.toString()
    )?.name || "Bowling Team";

  // Group balls by overs for timeline
  const groupedOvers = [];
  const balls = currentScore.scoreEveryBall || [];
  for (let i = 0; i < balls.length; i += 6) {
    groupedOvers.push(balls.slice(i, i + 6));
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.matchTitle}>{match.title}</h1>
        <div className={styles.refreshToggle}>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button onClick={fetchData} className={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Main Scoreboard */}
      <div className={styles.scoreboard}>
        <div className={styles.inningsLabel}>
          {match.currentInnings === 1 ? "FIRST INNINGS" : "SECOND INNINGS"}
        </div>

        <div className={styles.teamName}>{battingTeamName}</div>

        <div className={styles.mainScore}>
          {currentScore.runs}/{currentScore.wickets}
          <span className={styles.overs}>
            ({currentScore.overs}.{currentScore.balls})
          </span>
        </div>

        {target && (
          <div className={styles.targetInfo}>
            Target: {target} | Need {Math.max(0, target - currentScore.runs)} runs from {ballsLeft}{" "}
            balls
          </div>
        )}

        <div className={styles.rateInfo}>
          <div className={styles.rate}>
            <span className={styles.rateLabel}>CRR</span>
            <span className={styles.rateValue}>{crr}</span>
          </div>
          {rrr && (
            <div className={styles.rate}>
              <span className={styles.rateLabel}>RRR</span>
              <span className={styles.rateValue}>{rrr}</span>
            </div>
          )}
        </div>

        {match.state === "finished" && (
          <div className={styles.matchResult}>
            <strong>Match Finished!</strong>
            <p>{match.winningMargin}</p>
          </div>
        )}
      </div>

      {/* Current Partnership */}
      {currentScore.currentBatsmen?.length === 2 && (
        <div className={styles.partnership}>
          <h3>Current Partnership</h3>
          <div className={styles.partnershipDetails}>
            {currentScore.currentBatsmen.map((b) => (
              <div key={b.player._id} className={styles.batsmanChip}>
                <span className={styles.batsmanName}>
                  {b.player.name} {b.onStrike && "★"}
                </span>
                <span className={styles.batsmanScore}>
                  {b.runs}({b.balls})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Bowler */}
      {currentScore.currentBowler && (
        <div className={styles.bowlerCard}>
          <h3>Current Bowler</h3>
          <div className={styles.bowlerInfo}>
            <span className={styles.bowlerName}>{currentScore.currentBowler.name}</span>
            <span className={styles.bowlerFigs}>
              {currentScore.currentBowler.bowlingStats?.overs || 0}-
              {currentScore.currentBowler.bowlingStats?.maidens || 0}-
              {currentScore.currentBowler.bowlingStats?.runs || 0}-
              {currentScore.currentBowler.bowlingStats?.wickets || 0}
            </span>
            <span className={styles.bowlerEcon}>
              Econ: {currentScore.currentBowler.bowlingStats?.economy || "0.00"}
            </span>
          </div>
        </div>
      )}

      {/* Over-by-Over Timeline */}
      <div className={styles.timeline}>
        <h3>Recent Overs</h3>
        <div className={styles.oversContainer}>
          {groupedOvers
            .slice(-6)
            .reverse()
            .map((over, overIndex) => (
              <div key={overIndex} className={styles.overBlock}>
                <div className={styles.overNumber}>Over {groupedOvers.length - overIndex}</div>
                <div className={styles.ballsRow}>
                  {over.map((ball, ballIndex) => (
                    <span
                      key={ballIndex}
                      className={`${styles.ball} ${
                        ball === "W" ? styles.wicket : ball.includes("W") ? styles.extraWicket : ""
                      } ${ball === "4" ? styles.four : ""} ${ball === "6" ? styles.six : ""}`}
                    >
                      {ball}
                    </span>
                  ))}
                </div>
                <div className={styles.overRuns}>
                  {over.reduce((sum, b) => {
                    const num = parseInt(b.match(/\d+/)?.[0] || "0");
                    return sum + num;
                  }, 0)}{" "}
                  runs
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Current Innings Stats */}
      <div className={styles.statsSection}>
        <ScorecardTable
          title={`${battingTeamName} - Batting`}
          data={currentScore.currentBatsmen}
          type="bat"
          activeId={currentScore.currentBatsmen?.find((b) => b.onStrike)?.player?._id}
        />

        <ScorecardTable
          title={`${bowlingTeamName} - Bowling`}
          data={currentScore.bowlersPerformance}
          type="bowl"
          activeId={currentScore.currentBowler?._id}
        />

        {/* Extras */}
        <div className={styles.extrasCard}>
          <h3>Extras</h3>
          <div className={styles.extrasGrid}>
            <div>Wides: {currentScore.extras?.wides || 0}</div>
            <div>No Balls: {currentScore.extras?.noBalls || 0}</div>
            <div>Byes: {currentScore.extras?.byes || 0}</div>
            <div>Leg Byes: {currentScore.extras?.legByes || 0}</div>
            <div>
              <strong>Total: {currentScore.extras?.total || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Innings */}
      {prevInnings && (
        <div className={styles.previousInnings}>
          <div className={styles.divider}>
            <span>FIRST INNINGS COMPLETED</span>
          </div>

          <div className={styles.prevScore}>
            {match.teams.find(
              (t) =>
                t._id?.toString() ===
                (prevInnings.battingTeam?._id || prevInnings.battingTeam)?.toString()
            )?.name || "Team"}
            : {prevInnings.runs}/{prevInnings.wickets} ({prevInnings.overs} ov)
          </div>

          <ScorecardTable title="Batting Summary" data={prevInnings.currentBatsmen} type="bat" />

          <ScorecardTable
            title="Bowling Summary"
            data={prevInnings.bowlersPerformance}
            type="bowl"
          />
        </div>
      )}
    </div>
  );
}
