
"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import styles from "@/styles/LiveScore.module.css";

export default function LiveScorePage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showScorecard, setShowScorecard] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.post(`/api/match/${id}/score-update`);
      if (res.data.success) {
        setMatch(res.data.data);
        setAllPlayers(res.data.allPlayers || []);
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

  const crr = (
    currentScore.runs / ((currentScore.overs * 6 + currentScore.balls) / 6) || 0
  ).toFixed(2);
  const target = prevInnings ? prevInnings.runs + 1 : null;
  const totalBalls = (match?.overs || 0) * 6;
  const ballsDone = (currentScore?.overs || 0) * 6 + (currentScore?.balls || 0);
  const ballsLeft = totalBalls - ballsDone;
  const rrr =
    target && ballsLeft > 0 ? (((target - currentScore.runs) / ballsLeft) * 6).toFixed(2) : null;

  const battingTeam = match.teams.find(
    (t) =>
      t._id?.toString() === (currentScore.battingTeam?._id || currentScore.battingTeam)?.toString()
  );

  const bowlingTeam = match.teams.find(
    (t) =>
      t._id?.toString() === (currentScore.bowlingTeam?._id || currentScore.bowlingTeam)?.toString()
  );

  const getAllBatsmen = () => {
    return allPlayers
      .filter((p) => {
        const playerTeamId = p.team?._id || p.team;
        const battingTeamId = battingTeam?._id;
        return (
          playerTeamId?.toString() === battingTeamId?.toString() &&
          (p.battingStats?.balls > 0 || p.battingStats?.isOut)
        );
      })
      .sort((a, b) => {
        return (b.battingStats?.balls || 0) - (a.battingStats?.balls || 0);
      });
  };

  const getAllBowlers = () => {
    return allPlayers.filter((p) => {
      const playerTeamId = p.team?._id || p.team;
      const bowlingTeamId = bowlingTeam?._id;
      return playerTeamId?.toString() === bowlingTeamId?.toString() && p.bowlingStats?.balls > 0;
    });
  };

  const groupedOvers = [];
  const balls = currentScore.scoreEveryBall || [];
  for (let i = 0; i < balls.length; i += 6) {
    groupedOvers.push(balls.slice(i, i + 6));
  }

  const allBatsmen = getAllBatsmen();
  const allBowlers = getAllBowlers();

  const currentBowler = currentScore.bowlersPerformance?.find(
    (b) => b.player?.toString() === currentScore.currentBowler?._id?.toString()
  );

  return (
    <div className={styles.container}>
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

      <div className={styles.scoreboard}>
        <div className={styles.inningsLabel}>
          {match.currentInnings === 1 ? "FIRST INNINGS" : "SECOND INNINGS"}
        </div>

        <div className={styles.teamName}>{battingTeam?.name}</div>

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

      {currentScore.currentBatsmen?.length === 2 && !currentScore.isCompleted && (
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

      {currentScore.currentBowler && !currentScore.isCompleted && (
        <div className={styles.bowlerCard}>
          <h3>Current Bowler</h3>
          <div className={styles.bowlerInfo}>
            <span className={styles.bowlerName}>{currentScore.currentBowler.name}</span>
            <span className={styles.bowlerFigs}>
              {currentBowler?.overs || 0}.{currentBowler?.balls || 0} - {currentBowler?.runs || 0} -{" "}
              {currentBowler?.wickets || 0}
            </span>
            <span className={styles.bowlerEcon}>
              Econ:{" "}
              {currentBowler && (currentBowler.overs > 0 || currentBowler.balls > 0)
                ? (
                    currentBowler.runs / ((currentBowler.overs * 6 + currentBowler.balls) / 6) || 0
                  ).toFixed(2)
                : "0.00"}
            </span>
          </div>
        </div>
      )}

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
                        ball === "W" || ball.includes("W") ? styles.wicket : ""
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

      <div className={styles.scorecardToggle}>
        <button onClick={() => setShowScorecard(!showScorecard)} className={styles.toggleBtn}>
          {showScorecard ? "Hide" : "Show"} Full Scorecard
        </button>
      </div>

      {showScorecard && (
        <div className={styles.scorecardSection}>
          <div className={styles.scorecardCard}>
            <h3>{battingTeam?.name} - Batting</h3>
            <div className={styles.scorecardTable}>
              <div className={styles.scorecardHeader}>
                <span className={styles.playerCol}>Batsman</span>
                <span className={styles.statCol}>R</span>
                <span className={styles.statCol}>B</span>
                <span className={styles.statCol}>4s</span>
                <span className={styles.statCol}>6s</span>
                <span className={styles.statCol}>SR</span>
              </div>
              {allBatsmen.map((player) => (
                <div key={player._id} className={styles.scorecardRow}>
                  <div className={styles.playerCol}>
                    <span className={styles.playerName}>{player.name}</span>
                    <small className={styles.dismissal}>
                      {player.battingStats?.isOut
                        ? `${player.battingStats.dismissalType} ${
                            player.battingStats.dismissedBy?.name || ""
                          }`
                        : currentScore.currentBatsmen?.some((b) => b.player._id === player._id)
                        ? "batting"
                        : "not out"}
                    </small>
                  </div>
                  <span className={styles.statCol}>{player.battingStats?.runs || 0}</span>
                  <span className={styles.statCol}>{player.battingStats?.balls || 0}</span>
                  <span className={styles.statCol}>{player.battingStats?.fours || 0}</span>
                  <span className={styles.statCol}>{player.battingStats?.sixes || 0}</span>
                  <span className={styles.statCol}>{player.battingStats?.strikeRate || "0.0"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.scorecardCard}>
            <h3>{bowlingTeam?.name} - Bowling</h3>
            <div className={styles.scorecardTable}>
              <div className={styles.scorecardHeader}>
                <span className={styles.playerCol}>Bowler</span>
                <span className={styles.statCol}>O</span>
                <span className={styles.statCol}>R</span>
                <span className={styles.statCol}>W</span>
                <span className={styles.statCol}>Econ</span>
              </div>
              {allBowlers.map((player) => (
                <div key={player._id} className={styles.scorecardRow}>
                  <span className={styles.playerCol}>{player.name}</span>
                  <span className={styles.statCol}>
                    {player.bowlingStats?.overs || 0}.{player.bowlingStats?.balls || 0}
                  </span>
                  <span className={styles.statCol}>{player.bowlingStats?.runs || 0}</span>
                  <span className={styles.statCol}>{player.bowlingStats?.wickets || 0}</span>
                  <span className={styles.statCol}>{player.bowlingStats?.economy || "0.00"}</span>
                </div>
              ))}
            </div>
          </div>

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
      )}

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
        </div>
      )}
    </div>
  );
}
