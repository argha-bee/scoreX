"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "@/styles/CreateMatch.module.css";

export default function CreateMatchPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [format, setFormat] = useState("T20");
  const [overs, setOvers] = useState(20);
  const [wickets, setWickets] = useState(11);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [date, setDate] = useState("");

  const createMatch = async () => {
    if (!title || !team1 || !team2 || !overs) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/match/create", {
        title,
        venue,
        format,
        overs,
        wickets,
        team1: { name: team1, shortName: team1.slice(0, 3).toUpperCase() },
        team2: { name: team2, shortName: team2.slice(0, 3).toUpperCase() },
      });

      Swal.fire("Success", "Match created successfully", "success");

      router.push(`/dashboard/`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Failed to create match", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Match</h1>

      <div className={styles.form}>
        <label>Match Title</label>
        <input
          type="text"
          placeholder="Enter match title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Venue</label>
        <input
          type="text"
          placeholder="Enter venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />

        <div className={styles.row}>
          <div className={styles.col}>
            <label>Team 1</label>
            <input
              type="text"
              placeholder="Team 1 name"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
            />
          </div>
          <div className={styles.col}>
            <label>Team 2</label>
            <input
              type="text"
              placeholder="Team 2 name"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <label>Format</label>
            <select
              value={format}
              onChange={(e) => {
                const val = e.target.value;
                setFormat(val);
                if (val === "Custom") {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setOvers(val === "T20" ? 20 : 50); // set default overs for T20/ODI
                }
              }}
            >
              <option value="T20">T20</option>
              <option value="ODI">ODI</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className={styles.col}>
            <label>Starts at</label>
            <input
              type="date"
              value={date}
              min={Date.now()}
              max={Date.now() + 15}
              onChange={(e) => setDate(Number(e.target.value))}
            />
          </div>
        </div>
        {isCustom && (
          <div className={styles.row}>
            <div className={styles.col}>
              <label>Wickets</label>
              <input
                type="wickets"
                value={wickets}
                min={1}
                max={15}
                onChange={(e) => setWickets(Number(e.target.value))}
              />
            </div>

            <div className={styles.col}>
              <label>Overs</label>
              <input
                type="number"
                value={overs}
                min={1}
                max={50}
                onChange={(e) => setOvers(Number(e.target.value))}
              />
            </div>
          </div>
        )}
        <button onClick={createMatch} disabled={loading} className={styles.button}>
          {loading ? "Creating..." : "Create Match"}
        </button>
      </div>
    </div>
  );
}
