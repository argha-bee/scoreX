import styles from "@/styles/Scorecard.module.css";

const BattingCard = ({ team }) => {
  const activeBatsmen = team?.players?.filter(
    (p) => p.isPlaying || p.battingStats.isOut || p.battingStats.runs > 0
  );

  return (
    <div className={styles.battingCard}>
      <h3>{team?.name} Batting</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Batsman</th>
            <th>R</th>
            <th>B</th>
            <th>4s</th>
            <th>6s</th>
            <th>SR</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activeBatsmen?.map((player) => (
            <tr key={player._id}>
              <td className={styles.playerName}>
                {player.name}
                {player.isPlaying && <span className={styles.playing}>*</span>}
              </td>
              <td>{player.battingStats.runs}</td>
              <td>{player.battingStats.balls}</td>
              <td>{player.battingStats.fours}</td>
              <td>{player.battingStats.sixes}</td>
              <td>{player.battingStats.strikeRate}</td>
              <td className={styles.status}>
                {player.battingStats.isOut ? (
                  <span className={styles.out}>
                    {player.battingStats.dismissalType}
                    {player.battingStats.dismissedBy &&
                      ` b ${player.battingStats.dismissedBy.name}`}
                    {player.battingStats.caughtBy && ` c ${player.battingStats.caughtBy.name}`}
                  </span>
                ) : player.isPlaying ? (
                  <span className={styles.batting}>Batting</span>
                ) : (
                  <span className={styles.notOut}>Not Out</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BattingCard;
