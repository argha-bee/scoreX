import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWebSocket } from "@/hooks/useWebSocket";
import LiveScore from "@/components/Scorecard/LiveScore";
import MatchSummary from "@/components/Scorecard/MatchSummary";
import styles from "@/styles/Match.module.css";

const MatchPage = () => {
  const router = useRouter();
  const { id: matchId } = router.query;
  const { isConnected, lastUpdate } = useWebSocket(matchId);

  const [match, setMatch] = useState(null);
  const [currentScore, setCurrentScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  useEffect(() => {
    if (lastUpdate?.type === "score-update") {
      setCurrentScore(lastUpdate.data.score);
    }
  }, [lastUpdate]);

  const fetchMatch = async () => {
    try {
      const res = await fetch(`/api/match/${matchId}`);
      const data = await res.json();
      setMatch(data.match);

      if (data.match.scores?.length > 0) {
        setCurrentScore(data.match.scores[data.match.scores.length - 1]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching match:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading match...</div>;
  }

  if (!match) {
    return <div className={styles.error}>Match not found</div>;
  }

  return (
    <div className={styles.matchPage}>
      <div className={styles.liveIndicator}>
        {isConnected && match.status === "in-progress" && (
          <span className={styles.live}>● LIVE</span>
        )}
      </div>

      {match.status === "completed" ? (
        <MatchSummary match={match} summary={match.matchSummary} />
      ) : currentScore ? (
        <LiveScore match={match} score={currentScore} />
      ) : (
        <div className={styles.upcoming}>Match has not started yet</div>
      )}
    </div>
  );
};

export default MatchPage;
