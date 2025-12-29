import styles from "@/styles/Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>🚀 Loading your awesome experience…</p>
    </div>
  );
}
