// "use client";

// import { useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import styles from "@/styles/TossModal.module.css";

// export default function SquadModal({ match, onClose, onSave }) {
//   const [teams, setTeams] = useState(
//     match.teams.map((t) => ({
//       _id: t._id,
//       name: t.name,
//       players: t.players?.map((p) => p.name) || Array(11).fill(""),
//       captain: t.captain?.name || "",
//       wicketKeeper: t.wicketKeeper?.name || "",
//     }))
//   );
//   const [loading, setLoading] = useState(false);

//   const handlePlayerChange = (teamIndex, playerIndex, value) => {
//     const newTeams = [...teams];
//     newTeams[teamIndex].players[playerIndex] = value;
//     setTeams(newTeams);
//   };

//   const addPlayer = (teamIndex) => {
//     const newTeams = [...teams];
//     newTeams[teamIndex].players.push("");
//     setTeams(newTeams);
//   };

//   const handleSave = async () => {
//     // Validation
//     for (let t of teams) {
//       if (!t.captain || !t.players.includes(t.captain)) {
//         Swal.fire("Error", `Select a valid captain for ${t.name}`, "error");
//         return;
//       }
//       if (!t.wicketKeeper || !t.players.includes(t.wicketKeeper)) {
//         Swal.fire("Error", `Select a valid wicket-keeper for ${t.name}`, "error");
//         return;
//       }
//       if (t.players.length < 11) {
//         Swal.fire("Error", `${t.name} must have 11 players`, "error");
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const res = await axios.post(`/api/match/${match._id}/update-squad`, { teams });
//       if (res.data.success) {
//         Swal.fire("Success", "Squads updated!", "success");
//         onSave(res.data.match);
//         onClose();
//       } else {
//         Swal.fire("Error", res.data.message, "error");
//       }
//     } catch (err) {
//       console.error(err);
//       Swal.fire("Error", "Failed to update squads", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modalContent}>
//         <button className={styles.closeBtn} onClick={onClose}>
//           &times;
//         </button>
//         <h2 className={styles.title}>Declare / Update Squads</h2>

//         {teams.map((team, ti) => (
//           <div key={ti} style={{ marginBottom: "1rem" }}>
//             <h3>{team.name}</h3>
//             {team.players.map((player, pi) => (
//               <input
//                 key={pi}
//                 placeholder={`Player ${pi + 1}`}
//                 value={player}
//                 onChange={(e) => handlePlayerChange(ti, pi, e.target.value)}
//                 style={{ display: "block", width: "100%", margin: "0.3rem 0", padding: "0.5rem" }}
//               />
//             ))}
//             <button onClick={() => addPlayer(ti)} style={{ marginBottom: "0.5rem" }}>
//               Add Player
//             </button>

//             <div>
//               <label>
//                 Captain:
//                 <select
//                   value={team.captain}
//                   onChange={(e) => {
//                     const newTeams = [...teams];
//                     newTeams[ti].captain = e.target.value;
//                     setTeams(newTeams);
//                   }}
//                 >
//                   <option value="">Select</option>
//                   {team.players.map((p, i) => (
//                     <option key={i} value={p}>
//                       {p}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <label style={{ marginLeft: "1rem" }}>
//                 Wicket-Keeper:
//                 <select
//                   value={team.wicketKeeper}
//                   onChange={(e) => {
//                     const newTeams = [...teams];
//                     newTeams[ti].wicketKeeper = e.target.value;
//                     setTeams(newTeams);
//                   }}
//                 >
//                   <option value="">Select</option>
//                   {team.players.map((p, i) => (
//                     <option key={i} value={p}>
//                       {p}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//             </div>
//           </div>
//         ))}

//         <button
//           onClick={handleSave}
//           disabled={loading}
//           style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
//         >
//           {loading ? "Saving..." : "Save Squad"}
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/Dashboard.module.css";
import Team from "@/models/Team";

export default function SquadModal({ match, onClose, onSave }) {
  const [teams, setTeams] = useState(
    match.teams.map((t) => ({
      _id: t._id,
      name: t.name,
      players: t.players?.map((p) => p.name) || Array(11).fill(""),
      captain: t.captain?.name || "",
      wicketKeeper: t.wicketKeeper?.name || "",
    }))
  );



  const [loading, setLoading] = useState(false);

  const handlePlayerChange = (teamIndex, playerIndex, value) => {
    const newTeams = [...teams];
    newTeams[teamIndex].players[playerIndex] = value;
    setTeams(newTeams);
  };


  const handleSave = async () => {
    for (let t of teams) {
      if (!t.captain || !t.players.includes(t.captain)) {
        alert(`Select a valid captain for ${t.name}`);
        return;
      }
      if (!t.wicketKeeper || !t.players.includes(t.wicketKeeper)) {
        alert(`Select a valid wicket-keeper for ${t.name}`);
        return;
      }
    }

    setLoading(true);
    try {
      await axios.post(
        `/api/match/${match._id}/update-squad`,
        { teams },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) onSave();
    } catch (err) {
      console.error(err);
      alert("Failed to save squad");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Declare / Update Squad</h2>
        {teams.map((team, ti) => (
          <div key={team._id} style={{ marginBottom: "1rem" }}>
            <h3>{team.name}</h3>
            {team.players.map((p, pi) => (
              <input
                key={pi}
                value={p}
                placeholder={`Player ${pi + 1}`}
                onChange={(e) => handlePlayerChange(ti, pi, e.target.value)}
              />
            ))}

            <div style={{ marginTop: "0.5rem" }}>
              <label>
                Captain:
                <select
                  value={team.captain}
                  onChange={(e) =>
                    setTeams([
                      ...teams.slice(0, ti),
                      { ...team, captain: e.target.value },
                      ...teams.slice(ti + 1),
                    ])
                  }
                >
                  <option value="">Select</option>
                  {team.players.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ marginLeft: "1rem" }}>
                Wicket-Keeper:
                <select
                  value={team.wicketKeeper}
                  onChange={(e) =>
                    setTeams([
                      ...teams.slice(0, ti),
                      { ...team, wicketKeeper: e.target.value },
                      ...teams.slice(ti + 1),
                    ])
                  }
                >
                  <option value="">Select</option>
                  {team.players.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}

        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Squad"}
          </button>
          <button onClick={onClose} style={{ marginLeft: "1rem" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
