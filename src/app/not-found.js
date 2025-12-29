import Link from "next/link";
import styles from "@/styles/NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.glitch}>404</h1>

        <p className={styles.subtitle}>
          😵 Oops! This page drifted into another universe.
        </p>

        <div className={styles.emojiCloud}>
          🌈 🚀 ⭐ ⚡ 💫 🎯 🔮 🦄
        </div>

        <Link href="/" className={styles.button}>
          ⬅️ Take me home
        </Link>
      </div>
    </div>
  );
}
