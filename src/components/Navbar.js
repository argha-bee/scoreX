"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import styles from "@/styles/Navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  // State to track the active link
  const [activeLink, setActiveLink] = useState("");

  // Helper function to check if the link is active
  const isActiveLink = (path) => {
    return activeLink === path ? styles.navbarLinkActive : "";
  };

  // Update the active link when a user clicks on a link
  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        {/* Logo */}
        <Link href="/dashboard" className={styles.navbarLogo}>
          Score<span className={styles.spanX}>X</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link
            href="/"
            className={`${styles.navbarLink} ${isActiveLink("/")}`}
            onClick={() => handleLinkClick("/")}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`${styles.navbarLink} ${isActiveLink("/dashboard")}`}
            onClick={() => handleLinkClick("/dashboard")}
          >
            Dashboard
          </Link>
          <Link
            href="/about"
            className={`${styles.navbarLink} ${isActiveLink("/about")}`}
            onClick={() => handleLinkClick("/about")}
          >
            Records
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

        {/* Mobile Menu Button (Only visible on mobile/tablet) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`${styles.navbarToggle} md:hidden`} // Only show on smaller screens
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

      {/* Mobile Menu (Only visible on mobile/tablet) */}
      {menuOpen && (
        <div className={`${styles.navbarMobileMenu} ${menuOpen ? "open" : ""} md:hidden`}>
          <Link
            href="/"
            className={`${styles.navbarMobileLink} ${isActiveLink("/")}`}
            onClick={() => {
              handleLinkClick("/");
              setMenuOpen(false);
            }}
          >
            Home
          </Link>
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
          <Link
            href="/about"
            className={`${styles.navbarMobileLink} ${isActiveLink("/about")}`}
            onClick={() => {
              handleLinkClick("/about");
              setMenuOpen(false);
            }}
          >
            About
          </Link>

          {session ? (
            <div className={styles.navbarUser}>
              <span className={styles.navbarUserName}>{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
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
