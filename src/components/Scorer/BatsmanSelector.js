import { useState, useEffect } from "react";
import styles from "@/styles/Scorer.module.css";

const BatsmanSelector = ({ team, onSelect, excludeIds = [] }) => {
  const [selectedBatsman, setSelectedBatsman] = useState("");
  const [availablePlayers, setAvailablePlayers] = useState([]);

  useEffect(() => {
    if (team?.players) {
      const available = team.players.filter(
        (player) => !excludeIds.includes(player._id) && !player.battingStats.isOut
      );
      setAvailablePlayers(available);
    }
  }, [team, excludeIds]);

  const handleSelect = () => {
    if (selectedBatsman) {
      onSelect(selectedBatsman);
      setSelectedBatsman("");
    }
  };

  return (
    <div className={styles.batsmanSelector}>
      <h3>Select Next Batsman</h3>
      <div className={styles.selectorContent}>
        <select
          value={selectedBatsman}
          onChange={(e) => setSelectedBatsman(e.target.value)}
          className={styles.select}
        >
          <option value="">Choose a batsman</option>
          {availablePlayers.map((player) => (
            <option key={player._id} value={player._id}>
              {player.name} ({player.role})
            </option>
          ))}
        </select>
        <button onClick={handleSelect} disabled={!selectedBatsman} className={styles.selectButton}>
          Select
        </button>
      </div>
    </div>
  );
};

export default BatsmanSelector;


