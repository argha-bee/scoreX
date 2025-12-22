import styles from "@/styles/ScoreUpdate.module.css";

export default function ScoreHeader({ score }) {
  return (
    <div className={styles.header}>
      <h1>
        {score.battingTeam.name} vs {score.bowlingTeam.name}
      </h1>
      <div className={styles.score}>
        {score.runs}/{score.wickets} ({score.overs}.{score.balls}) RR: {score.runRate}
      </div>
    </div>
  );
}
