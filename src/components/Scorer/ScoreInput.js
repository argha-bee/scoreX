import { useState } from "react";
import styles from "@/styles/Scorer.module.css";

const ScoreInput = ({ onBallUpdate, currentBatsmen, currentBowler }) => {
  const [runs, setRuns] = useState(0);
  const [extras, setExtras] = useState({ type: "", runs: 0 });
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState("");
  const [commentary, setCommentary] = useState("");

  const handleSubmit = async () => {
    const ballData = {
      runs,
      extras: extras.type ? extras : null,
      isWicket,
      wicketType: isWicket ? wicketType : null,
      commentary,
    };

    await onBallUpdate(ballData);

    // Reset form
    setRuns(0);
    setExtras({ type: "", runs: 0 });
    setIsWicket(false);
    setWicketType("");
    setCommentary("");
  };

  const quickRuns = [0, 1, 2, 3, 4, 6];

  return (
    <div className={styles.scoreInput}>
      <div className={styles.header}>
        <h2>Ball Input</h2>
        <div className={styles.currentPlayers}>
          <div>
            <strong>On Strike:</strong>{" "}
            {currentBatsmen?.find((b) => b.onStrike)?.player?.name || "Select"}
          </div>
          <div>
            <strong>Bowler:</strong> {currentBowler?.name || "Select"}
          </div>
        </div>
      </div>

      <div className={styles.runsButtons}>
        <h3>Runs</h3>
        <div className={styles.buttonGroup}>
          {quickRuns.map((run) => (
            <button
              key={run}
              className={`${styles.runButton} ${runs === run ? styles.active : ""}`}
              onClick={() => setRuns(run)}
            >
              {run}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.extrasSection}>
        <h3>Extras</h3>
        <div className={styles.extrasGroup}>
          <select
            value={extras.type}
            onChange={(e) => setExtras({ ...extras, type: e.target.value })}
            className={styles.select}
          >
            <option value="">No Extra</option>
            <option value="wide">Wide</option>
            <option value="no-ball">No Ball</option>
            <option value="bye">Bye</option>
            <option value="leg-bye">Leg Bye</option>
          </select>
          {extras.type && (
            <input
              type="number"
              min="0"
              value={extras.runs}
              onChange={(e) => setExtras({ ...extras, runs: parseInt(e.target.value) || 0 })}
              placeholder="Extra runs"
              className={styles.input}
            />
          )}
        </div>
      </div>

      <div className={styles.wicketSection}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={isWicket}
            onChange={(e) => setIsWicket(e.target.checked)}
          />
          <span>Wicket</span>
        </label>

        {isWicket && (
          <select
            value={wicketType}
            onChange={(e) => setWicketType(e.target.value)}
            className={styles.select}
          >
            <option value="">Select wicket type</option>
            <option value="bowled">Bowled</option>
            <option value="caught">Caught</option>
            <option value="lbw">LBW</option>
            <option value="run out">Run Out</option>
            <option value="stumped">Stumped</option>
            <option value="hit wicket">Hit Wicket</option>
          </select>
        )}
      </div>

      <div className={styles.commentarySection}>
        <textarea
          value={commentary}
          onChange={(e) => setCommentary(e.target.value)}
          placeholder="Add commentary (optional)"
          className={styles.textarea}
          rows={2}
        />
      </div>

      <button
        onClick={handleSubmit}
        className={styles.submitButton}
        disabled={!currentBatsmen?.length || !currentBowler}
      >
        Record Ball
      </button>
    </div>
  );
};

export default ScoreInput;
