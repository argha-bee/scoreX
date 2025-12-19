import { useState, useEffect } from "react";
import styles from "@/styles/Scorer.module.css";

const BowlerSelector = ({ team, onSelect, currentBowlerId }) => {
  const [selectedBowler, setSelectedBowler] = useState("");
  const [availableBowlers, setAvailableBowlers] = useState([]);

  useEffect(() => {
    if (team?.players) {
      const available = team.players.filter((player) => player._id !== currentBowlerId);
      setAvailableBowlers(available);
    }
  }, [team, currentBowlerId]);

  const handleSelect = () => {
    if (selectedBowler) {
      onSelect(selectedBowler);
      setSelectedBowler("");
    }
  };

  return (
    <div className={styles.bowlerSelector}>
      <h3>Select Bowler for Next Over</h3>
      <div className={styles.selectorContent}>
        <select
          value={selectedBowler}
          onChange={(e) => setSelectedBowler(e.target.value)}
          className={styles.select}
        >
          <option value="">Choose a bowler</option>
          {availableBowlers.map((player) => (
            <option key={player._id} value={player._id}>
              {player.name} - {player.bowlingStats.overs}.{player.bowlingStats.balls} overs,
              {player.bowlingStats.wickets}/{player.bowlingStats.runs}
            </option>
          ))}
        </select>
        <button onClick={handleSelect} disabled={!selectedBowler} className={styles.selectButton}>
          Select Bowler
        </button>
      </div>
    </div>
  );
};

export default BowlerSelector;
