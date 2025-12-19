import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useWebSocket } from "@/hooks/useWebSocket";
import ScoreInput from "@/components/Scorer/ScoreInput";
import BatsmanSelector from "@/components/Scorer/BatsmanSelector";
import BowlerSelector from "@/components/Scorer/BowlerSelector";
import LiveScore from "@/components/Scorecard/LiveScore";
import styles from "@/styles/Scorer.module.css";

const ScorerPage = () => {
  const router = useRouter();
  const { id: matchId } = router.query;
  const { data: session, status } = useSession();
  const { isConnected, lastUpdate } = useWebSocket(matchId);

  const [match, setMatch] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsBatsman, setNeedsBatsman] = useState(false);
  const [needsBowler, setNeedsBowler] = useState(false);

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  useEffect(() => {
    if (lastUpdate?.type === "score-update") {
      setScore(lastUpdate.data.score);
    }
  }, [lastUpdate]);

  const fetchMatchData = async () => {
    try {
      const res = await fetch(`/api/match/${matchId}`);
      const data = await res.json();
      setMatch(data.match);

      // Get current score
      const currentScore = data.match.scores[data.match.scores.length - 1];
      if (currentScore) {
        const scoreRes = await fetch(`/api/score/${currentScore._id}`);
        const scoreData = await scoreRes.json();
        setScore(scoreData.score);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching match:", error);
      setLoading(false);
    }
  };

  const handleBallUpdate = async (ballData) => {
    try {
      const res = await fetch("/api/score/ball", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreId: score._id,
          ...ballData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setScore(data.score);

        // Check if need new batsman
        if (ballData.isWicket) {
          setNeedsBatsman(true);
        }

        // Check if over complete
        if (data.score.balls === 0 && data.score.overs > 0) {
          setNeedsBowler(true);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error recording ball:", error);
      alert("Error recording ball");
    }
  };

  const handleBatsmanSelect = async (batsmanId) => {
    try {
      const res = await fetch("/api/score/wicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreId: score._id,
          newBatsmanId: batsmanId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        setNeedsBatsman(false);
      }
    } catch (error) {
      console.error("Error selecting batsman:", error);
    }
  };

  const handleBowlerSelect = async (bowlerId) => {
    try {
      const res = await fetch("/api/score/over", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreId: score._id,
          newBowlerId: bowlerId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        setNeedsBowler(false);
      }
    } catch (error) {
      console.error("Error selecting bowler:", error);
    }
  };

  if (status === "loading" || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (!match || !score) {
    return <div className={styles.error}>Match not found</div>;
  }

  const battingTeam = match.teams.find((t) => t._id === score.battingTeam);
  const bowlingTeam = match.teams.find((t) => t._id === score.bowlingTeam);

  return (
    <div className={styles.scorerPage}>
      <div className={styles.header}>
        <h1>{match.title}</h1>
        <div className={styles.connectionStatus}>
          {isConnected ? (
            <span className={styles.connected}>● Live</span>
          ) : (
            <span className={styles.disconnected}>● Offline</span>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.scoringPanel}>
          {needsBatsman ? (
            <BatsmanSelector
              team={battingTeam}
              onSelect={handleBatsmanSelect}
              excludeIds={score.currentBatsmen.map((b) => b.player._id)}
            />
          ) : needsBowler ? (
            <BowlerSelector
              team={bowlingTeam}
              onSelect={handleBowlerSelect}
              currentBowlerId={score.currentBowler?._id}
            />
          ) : (
            <ScoreInput
              onBallUpdate={handleBallUpdate}
              currentBatsmen={score.currentBatsmen}
              currentBowler={score.currentBowler}
            />
          )}
        </div>

        <div className={styles.scorecardPanel}>
          <LiveScore match={match} score={score} />
        </div>
      </div>
    </div>
  );
};

export default ScorerPage;
