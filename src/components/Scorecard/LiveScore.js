import BattingCard from "./BattingCard";
import BowlingCard from "./BowlingCard";
import styles from "@/styles/Scorecard.module.css";

const LiveScore = ({ match, score }) => {
  const battingTeam = match.teams.find((t) => t._id === score.battingTeam);
  const bowlingTeam = match.teams.find((t) => t._id === score.bowlingTeam);

  return (
    <div className={styles.liveScore}>
      <div className={styles.scoreHeader}>
        <div className={styles.teamScore}>
          <h2>{battingTeam?.name}</h2>
          <div className={styles.runs}>
            {score.runs}/{score.wickets}
          </div>
          <div className={styles.overs}>
            ({score.overs}.{score.balls} overs)
          </div>
        </div>
        <div className={styles.runRate}>
          <div className={styles.crr}>CRR: {score.runRate}</div>
          {score.requiredRunRate && <div className={styles.rrr}>RRR: {score.requiredRunRate}</div>}
        </div>
      </div>

      <div className={styles.currentPlayers}>
        <h3>Current Partnership</h3>
        <div className={styles.batsmen}>
          {score.currentBatsmen?.map((batsman) => (
            <div
              key={batsman.player._id}
              className={`${styles.batsmanRow} ${batsman.onStrike ? styles.onStrike : ""}`}
            >
              <span className={styles.name}>
                {batsman.player.name}
                {batsman.onStrike && <span className={styles.strikeIndicator}>*</span>}
              </span>
              <span className={styles.stats}>
                {batsman.player.battingStats.runs} ({batsman.player.battingStats.balls})
              </span>
            </div>
          ))}
        </div>

        {score.currentBowler && (
          <div className={styles.bowler}>
            <strong>Bowler:</strong> {score.currentBowler.name} -
            {score.currentBowler.bowlingStats.overs}.{score.currentBowler.bowlingStats.balls} overs,
            {score.currentBowler.bowlingStats.wickets}/{score.currentBowler.bowlingStats.runs}
          </div>
        )}
      </div>

      <div className={styles.currentOver}>
        <h3>This Over</h3>
        <div className={styles.overBalls}>
          {score.currentOver?.balls?.map((ball, index) => (
            <span key={index} className={styles.ball}>
              {ball.runs}
              {ball.extras?.type && `+${ball.extras.runs}`}
              {ball.isWicket && "W"}
            </span>
          ))}
        </div>
      </div>

      <BattingCard team={battingTeam} />
      <BowlingCard team={bowlingTeam} />
    </div>
  );
};

export default LiveScore;
