import styles from "@/styles/Scorecard.module.css";

const BowlingCard = ({ team }) => {
  const bowlers = team?.players?.filter((p) => p.bowlingStats.balls > 0);

  return (
    <div className={styles.bowlingCard}>
      <h3>{team?.name} Bowling</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Bowler</th>
            <th>O</th>
            <th>M</th>
            <th>R</th>
            <th>W</th>
            <th>Econ</th>
            <th>WD</th>
            <th>NB</th>
          </tr>
        </thead>
        <tbody>
          {bowlers?.map((player) => (
            <tr key={player._id}>
              <td className={styles.playerName}>
                {player.name}
                {player.isPlaying && <span className={styles.bowling}>*</span>}
              </td>
              <td>
                {player.bowlingStats.overs}.{player.bowlingStats.balls}
              </td>
              <td>{player.bowlingStats.maidens}</td>
              <td>{player.bowlingStats.runs}</td>
              <td>{player.bowlingStats.wickets}</td>
              <td>{player.bowlingStats.economy}</td>
              <td>{player.bowlingStats.wides}</td>
              <td>{player.bowlingStats.noBalls}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BowlingCard;
