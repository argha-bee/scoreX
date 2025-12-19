import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "@/styles/Match.module.css";

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/match/list?status=in-progress");
      const data = await res.json();
      setMatches(data.matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div style={{ padding: "40px", minHeight: "100vh", background: "#f7fafc" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "32px" }}>Live Matches</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {matches.map((match) => (
            <div
              key={match._id}
              onClick={() => router.push(`/match/${match._id}`)}
              style={{
                padding: "24px",
                background: "white",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>{match.title}</h3>
              <p style={{ color: "#4a5568", marginBottom: "8px" }}>{match.format}</p>
              <p style={{ color: "#e53e3e", fontWeight: "bold" }}>● LIVE</p>
            </div>
          ))}
        </div>

        {session && (
          <button
            onClick={() => router.push("/match/create")}
            style={{
              marginTop: "32px",
              padding: "16px 32px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Create New Match
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
