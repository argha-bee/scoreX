"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import styles from "@/styles/Navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  const [activeLink, setActiveLink] = useState("");

  const isActiveLink = (path) => {
    return activeLink === path ? styles.navbarLinkActive : "";
  };

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        <Link href="/dashboard" className={styles.navbarLogo}>
          Score<span className={styles.spanX}>X</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          
          <Link
            href="/dashboard"
            className={`${styles.navbarLink} ${isActiveLink("/dashboard")}`}
            onClick={() => handleLinkClick("/dashboard")}
          >
            Dashboard
          </Link>
          
          {session && (
            <Link
              href="/dashboard/create"
              className={`${styles.navbarLink} ${isActiveLink("/dashboard/create")}`}
              onClick={() => handleLinkClick("/dashboard/create")}
            >
              Create Match
            </Link>
          )}

          {session ? (
            <div className={styles.navbarUser}>
              <span className={styles.navbarUserName}>{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={`${styles.navbarLink} bg-indigo-600 text-white hover:bg-indigo-700`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={`${styles.navbarLink} bg-indigo-600 text-white hover:bg-indigo-700`}
            >
              Continue as a Scorer
            </Link>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`${styles.navbarToggle} md:hidden`} 
        >
          <svg
            className={`${styles.navbarIcon} ${menuOpen ? styles.navbarIconOpen : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className={`${styles.navbarMobileMenu} ${menuOpen ? "open" : ""} md:hidden`}>
          
          <Link
            href="/dashboard"
            className={`${styles.navbarMobileLink} ${isActiveLink("/dashboard")}`}
            onClick={() => {
              handleLinkClick("/dashboard");
              setMenuOpen(false);
            }}
          >
            Dashboard
          </Link>
          
        

          {session ? (
            <div className={styles.navbarUser}>
              <span className={styles.navbarUserName}>{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/dashboard" })}
                className={`${styles.navbarMobileLink} bg-indigo-600 text-white`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={`${styles.navbarMobileLink} bg-indigo-600 text-white`}
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
