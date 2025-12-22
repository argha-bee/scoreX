import styles from "@/styles/ScoreUpdate.module.css";

export default function BatsmenPanel({ batsmen }) {
  return (
    <div className={styles.section}>
      <h2>Current Batsmen</h2>
      <div className={styles.flex}>
        {batsmen.map((b) => (
          <div key={b.player._id} className={styles.batsmanCard}>
            <span>
              <strong>{b.player.name}</strong> {b.onStrike ? "(on strike)" : ""}
            </span>
            <span>Runs: {b.player.battingStats.runs}</span>
            <span>Balls: {b.player.battingStats.balls}</span>
            <span>
              Fours: {b.player.battingStats.fours} | Sixes: {b.player.battingStats.sixes}
            </span>
            <span>SR: {b.player.battingStats.strikeRate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
