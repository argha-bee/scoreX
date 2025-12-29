
import styles from "@/styles/PlayerSelectionModal.module.css";

export default function PlayerSelectionModal({ title, players, onSelect, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>

        {players.length === 0 ? (
          <p className={styles.emptyState}>No players available</p>
        ) : (
          <div className={styles.playerList}>
            {players.map((p) => (
              <button key={p._id} className={styles.playerBtn} onClick={() => onSelect(p._id)}>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>{p.name}</span>
                  <span className={styles.playerJersey}>#{p.jerseyNumber}</span>
                </div>
                <span className={styles.playerRole}>{p.role}</span>
              </button>
            ))}
          </div>
        )}

        <button onClick={onClose} className={styles.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}
