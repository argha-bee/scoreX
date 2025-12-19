// // // app/dashboard/page.js
// // import { getServerSession } from "next-auth/next";
// // import { authOptions } from "../api/auth/[...nextauth]/route";
// // import Image from "next/image";

// // export default async function DashboardPage() {
// //   const session = await getServerSession(authOptions);

// //   if (!session) {
// //     return <p>Please log in</p>; // Or redirect
// //   }
// //   console.log(session.user);
// //   return (
// //     <div>
// //       <h1>Welcome, {session.user.name}</h1>
// //       <p>Your email: {session.user.email}</p>
// //       <p>Your username: {session.user.username}</p>
// //       <div>
// //         your dp:
// //         <Image src={session.user.image} alt="A static image" width={80} height={80} />
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import styles from "@/styles/Dashboard.module.css";
// import Swal from "sweetalert2";

// export default function Dashboard() {
//   const [matches, setMatches] = useState([]);
//   const [status, setStatus] = useState("ongoing"); // default
//   const [loading, setLoading] = useState(false);

//   // Fetch matches whenever status changes
//   useEffect(() => {
//     const fetchMatches = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(`/api/match?status=${status}`);
//         setMatches(res.data.matches);
//       } catch (err) {
//         Swal.fire({
//           icon: "error",
//           title: "Oops...",
//           text: err.response?.data?.message || "Failed to load matches",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMatches();
//   }, [status]);

//   return (
//     <div className={styles.dashboardContainer}>
//       <h1 className={styles.dashboardTitle}>Dashboard</h1>

//       {/* Tabs */}
//       <div className={styles.tabs}>
//         <button
//           className={`${styles.tabButton} ${status === "ongoing" ? styles.active : ""}`}
//           onClick={() => setStatus("ongoing")}
//         >
//           Live Matches
//         </button>
//         <button
//           className={`${styles.tabButton} ${status === "past" ? styles.active : ""}`}
//           onClick={() => setStatus("past")}
//         >
//           Past Matches
//         </button>
//         <button
//           className={`${styles.tabButton} ${status === "upcoming" ? styles.active : ""}`}
//           onClick={() => setStatus("upcoming")}
//         >
//           Scheduled Matches
//         </button>
//       </div>

//       {/* Matches List */}
//       {loading ? (
//         <p>Loading matches...</p>
//       ) : matches.length === 0 ? (
//         <p>No matches found.</p>
//       ) : (
//         <div className={styles.matchesList}>
//           {matches
//             .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) // descending
//             .map((match) => (
//               <div key={match._id} className={styles.matchCard}>
//                 <div className={styles.matchHeader}>
//                   <span className={styles.matchTeams}>
//                     {match.teamA} vs {match.teamB}
//                   </span>
//                   <span className={styles.matchTime}>
//                     {new Date(match.startTime).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className={styles.matchStatus}>Status: {match.status.toUpperCase()}</div>
//               </div>
//             ))}
//         </div>
//       )}
//     </div>
//   );
// }

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // redirect("/auth/login");
  }

  return <DashboardClient />;
}
