import styles from "@/styles/ScoreUpdate.module.css";

export default function BallFeed({ balls }) {
  return (
    <div className={styles.section}>
      <h2>Ball-by-Ball</h2>
      {balls.map((ball) => (
        <div key={ball._id} className={styles.feedItem}>
          <span>
            Over {ball.overNumber}.{ball.ballNumber}: {ball.runs} run(s)
            {ball.isWicket ? ` | Wicket: ${ball.wicketType}` : ""}
          </span>
          <small>{ball.commentary}</small>
        </div>
      ))}
    </div>
  );
}
