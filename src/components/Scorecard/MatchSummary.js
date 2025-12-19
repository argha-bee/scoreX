import styles from "@/styles/Scorecard.module.css";

const MatchSummary = ({ match, summary }) => {
  return (
    <div className={styles.matchSummary}>
      <div className={styles.summaryHeader}>
        <h1>Match Summary</h1>
        <div className={styles.matchTitle}>{match.title}</div>
        <div className={styles.venue}>
          {match.venue} • {new Date(match.date).toLocaleDateString()}
        </div>
      </div>

      <div className={styles.result}>
        {match.winner ? (
          <div className={styles.winner}>
            <h2>
              {match.winner.name} won by {match.winningMargin}
            </h2>
          </div>
        ) : (
          <div className={styles.inProgress}>Match In Progress</div>
        )}
      </div>

      <div className={styles.summaryStats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Runs</div>
          <div className={styles.statValue}>{summary.totalRuns}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Wickets</div>
          <div className={styles.statValue}>{summary.totalWickets}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Overs</div>
          <div className={styles.statValue}>{summary.totalOvers}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Run Rate</div>
          <div className={styles.statValue}>{summary.runRate}</div>
        </div>
      </div>

      <div className={styles.highlights}>
        <div className={styles.highlight}>
          <h3>Top Scorer</h3>
          {summary.highestScorer ? (
            <div className={styles.highlightPlayer}>
              <div className={styles.playerName}>{summary.highestScorer.player.name}</div>
              <div className={styles.playerStat}>
                {summary.highestScorer.runs} runs ({summary.highestScorer.player.battingStats.balls}{" "}
                balls)
              </div>
            </div>
          ) : (
            <div className={styles.noData}>No data</div>
          )}
        </div>

        <div className={styles.highlight}>
          <h3>Best Bowler</h3>
          {summary.bestBowler ? (
            <div className={styles.highlightPlayer}>
              <div className={styles.playerName}>{summary.bestBowler.player.name}</div>
              <div className={styles.playerStat}>
                {summary.bestBowler.wickets}/{summary.bestBowler.runs}(
                {summary.bestBowler.player.bowlingStats.overs}.
                {summary.bestBowler.player.bowlingStats.balls} overs)
              </div>
            </div>
          ) : (
            <div className={styles.noData}>No data</div>
          )}
        </div>
      </div>

      <div className={styles.teams}>
        {match.teams?.map((team, index) => (
          <div key={team._id} className={styles.teamSummary}>
            <h3>{team.name}</h3>

            <div className={styles.innings}>
              <h4>Innings {index + 1}</h4>
              {match.scores[index] && (
                <div className={styles.inningsScore}>
                  {match.scores[index].runs}/{match.scores[index].wickets}(
                  {match.scores[index].overs}.{match.scores[index].balls} overs)
                </div>
              )}
            </div>

            <div className={styles.topPerformers}>
              <div>
                <strong>Top Batsman:</strong>
                {/* Add top batsman logic */}
              </div>
              <div>
                <strong>Top Bowler:</strong>
                {/* Add top bowler logic */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchSummary;
