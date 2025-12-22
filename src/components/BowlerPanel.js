import styles from "@/styles/ScoreUpdate.module.css";

export default function BowlerPanel({ bowler }) {
  return (
    <div className={styles.section}>
      <h2>Current Bowler</h2>
      <div className={styles.bowlerCard}>
        <span>
          <strong>{bowler.name}</strong>
        </span>
        <span>
          Overs: {bowler.bowlingStats.overs}.{bowler.bowlingStats.balls}
        </span>
        <span>
          Runs: {bowler.bowlingStats.runs} | Wickets: {bowler.bowlingStats.wickets}
        </span>
        <span>Econ: {bowler.bowlingStats.economy}</span>
      </div>
    </div>
  );
}
