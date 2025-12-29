"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import styles from "@/styles/MatchSummary.module.css";
import ScorecardTable from "@/components/ScorecardTable";

export default function MatchSummaryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scorecard");

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get(`/api/match/${id}/match-summary`);
      if (res.data.success) setSummary(res.data.summary);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) return <div className={styles.loader}>Loading Match Summary...</div>;
  if (!summary) return <div className={styles.error}>Match summary not available</div>;

  const { match, teams, innings, ballByBall } = summary;
  const winnerTeam = teams.find((t) => (t._id || t).toString() === match.winner?._id?.toString());

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          ← Back
        </button>
        <h1 className={styles.title}>{match.title}</h1>
        <div className={styles.matchInfo}>
          <span>{match.venue}</span>
          <span>•</span>
          <span>{match.date ? new Date(match.date).toLocaleDateString() : ""}</span>
        </div>
      </div>

      {/* Match Result */}
      <div className={styles.resultCard}>
        {match.state === "finished" ? (
          <>
            <div className={styles.resultLabel}>Match Finished</div>
            <div className={styles.winnerName}>{winnerTeam ? winnerTeam.name : "Match Tied"}</div>
            <div className={styles.winningMargin}>{match.winningMargin}</div>
          </>
        ) : (
          <>
            <div className={styles.resultLabel}>Match Status</div>
            <div className={styles.statusText}>
              {match.state?.replaceAll("-", " ").toUpperCase()}
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "scorecard" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("scorecard")}
        >
          Scorecard
        </button>
        <button
          className={`${styles.tab} ${activeTab === "timeline" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          Ball-by-Ball
        </button>
      </div>

      {/* Scorecard Tab */}
      {activeTab === "scorecard" && (
        <div className={styles.scorecardSection}>
          {innings.map((inning, idx) => {
            const battingTeam = teams.find(
              (t) =>
                (t._id || t).toString() ===
                (inning.battingTeam?._id || inning.battingTeam)?.toString()
            );
            const bowlingTeam = teams.find(
              (t) =>
                (t._id || t).toString() ===
                (inning.bowlingTeam?._id || inning.bowlingTeam)?.toString()
            );

            return (
              <div key={idx} className={styles.inningsCard}>
                <div className={styles.inningsHeader}>
                  <h2>{battingTeam?.name || `Innings ${inning.innings}`}</h2>
                  <div className={styles.inningsScore}>
                    {inning.runs}/{inning.wickets} ({inning.overs}.{inning.balls} ov)
                  </div>
                </div>

                <div className={styles.extrasInfo}>
                  Extras: {inning.extras?.total || 0} (WD: {inning.extras?.wides || 0}, NB:{" "}
                  {inning.extras?.noBalls || 0}, B: {inning.extras?.byes || 0}, LB:{" "}
                  {inning.extras?.legByes || 0})
                </div>

                <div className={styles.runRate}>
                  Run Rate: {inning.runRate?.toFixed(2) || "0.00"}
                </div>

                <ScorecardTable title="Batting" data={inning.batsmen} type="bat" />
                <ScorecardTable
                  title={`${bowlingTeam?.name || "Opponent"} Bowling`}
                  data={inning.bowlers}
                  type="bowl"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <div className={styles.timelineSection}>
          {innings.map((inning, inningIdx) => {
            const battingTeam = teams.find(
              (t) =>
                (t._id || t).toString() ===
                (inning.battingTeam?._id || inning.battingTeam)?.toString()
            );

            // Group balls by over
            const ballsByOver = {};
            (ballByBall || [])
              .filter((b) => b.innings === inning.innings)
              .forEach((ball) => {
                const over = ball.overNumber;
                if (!ballsByOver[over]) ballsByOver[over] = [];
                ballsByOver[over].push(ball);
              });

            return (
              <div key={inningIdx} className={styles.inningsTimeline}>
                <h2 className={styles.timelineTitle}>
                  {battingTeam?.name} - Innings {inning.innings}
                </h2>

                {Object.keys(ballsByOver).length === 0 ? (
                  <p className={styles.emptyTimeline}>No ball-by-ball data available</p>
                ) : (
                  Object.entries(ballsByOver)
                    .reverse()
                    .map(([overNum, balls]) => (
                      <div key={overNum} className={styles.overCard}>
                        <div className={styles.overHeader}>
                          <span className={styles.overNum}>Over {overNum}</span>
                          <span className={styles.overBowler}>
                            {balls[0]?.bowler?.name || "Bowler"}
                          </span>
                        </div>
                        <div className={styles.ballsList}>
                          {balls.map((ball, ballIdx) => {
                            const label = ball.isWicket
                              ? "W"
                              : ball.extras?.type
                              ? `${ball.extras.runs || ""}${ball.extras.type.substring(0, 2)}`
                              : ball.runs?.toString() || "0";

                            return (
                              <div key={ballIdx} className={styles.ballItem}>
                                <div
                                  className={`${styles.ballBadge} ${
                                    ball.isWicket
                                      ? styles.wicketBall
                                      : ball.runs === 4
                                      ? styles.fourBall
                                      : ball.runs === 6
                                      ? styles.sixBall
                                      : ""
                                  }`}
                                >
                                  {label}
                                </div>
                                <div className={styles.ballDetails}>
                                  <strong>{ball.batsman?.name}</strong>
                                  {ball.isWicket && (
                                    <span className={styles.wicketInfo}>
                                      {ball.wicketType} by {ball.bowler?.name}
                                      {ball.fielder?.name && ` (c ${ball.fielder.name})`}
                                    </span>
                                  )}
                                  {ball.commentary && (
                                    <span className={styles.commentary}>{ball.commentary}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className={styles.overSummary}>
                          {balls.reduce((sum, b) => sum + (b.runs || 0) + (b.extras?.runs || 0), 0)}{" "}
                          runs from this over
                        </div>
                      </div>
                    ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
