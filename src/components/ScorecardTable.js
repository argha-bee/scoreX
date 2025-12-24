// /components/ScorecardTable.jsx
import styles from "@/styles/ScorecardTable.module.css";

export default function ScorecardTable({ title, data, type, activeId }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No {type === "bat" ? "batsmen" : "bowlers"} yet</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <span className={styles.playerCol}>{title}</span>
        {type === "bat" ? (
          <>
            <span className={styles.statValue}>R</span>
            <span className={styles.statValue}>B</span>
            <span className={styles.statValue}>4s</span>
            <span className={styles.statValue}>6s</span>
            <span className={styles.statValue}>SR</span>
          </>
        ) : (
          <>
            <span className={styles.statValue}>O</span>
            <span className={styles.statValue}>R</span>
            <span className={styles.statValue}>W</span>
            <span className={styles.statValue}>Econ</span>
          </>
        )}
      </div>

      {data.map((item, index) => {
        const p = item.player;
        const isActive = activeId && p?._id?.toString() === activeId.toString();
        const isOut = p?.battingStats?.isOut;

        return (
          <div
            key={p?._id || index}
            className={`${styles.tableRow} ${isActive ? styles.activeRow : ""}`}
          >
            <div className={styles.playerNameCol}>
              <span className={styles.nameText}>
                {p?.name || "Unknown"} {item.onStrike && "★"}
              </span>
              {type === "bat" && (
                <small className={styles.dismissalText}>
                  {isOut
                    ? `(${p.battingStats.dismissalType} ${p.battingStats.dismissedBy?.name || ""})`
                    : "not out"}
                </small>
              )}
            </div>

            {type === "bat" ? (
              <>
                <span className={styles.statValue}>{item.runs || 0}</span>
                <span className={styles.statValue}>{item.balls || 0}</span>
                <span className={styles.statValue}>{p?.battingStats?.fours || 0}</span>
                <span className={styles.statValue}>{p?.battingStats?.sixes || 0}</span>
                <span className={styles.statValue}>
                  {item.balls > 0 ? ((item.runs / item.balls) * 100).toFixed(1) : "0.0"}
                </span>
              </>
            ) : (
              <>
                <span className={styles.statValue}>
                  {item.overs || 0}.{item.balls || 0}
                </span>
                <span className={styles.statValue}>{item.runs || 0}</span>
                <span className={styles.statValue}>{item.wickets || 0}</span>
                <span className={styles.statValue}>
                  {item.overs > 0 || item.balls > 0
                    ? (item.runs / ((item.overs * 6 + item.balls) / 6) || 0).toFixed(2)
                    : "0.00"}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
