"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import styles from "@/styles/Auth.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      identifier: form.identifier,
      password: form.password,
    });

    if (res.error) setError(res.error);
    else router.push("/dashboard");
  };

  return (
    <div className={styles.authContainer}>
      <h1 className={styles.authTitle}>Login</h1>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <input
          type="text"
          name="identifier"
          placeholder="Email or Username"
          className={styles.authInput}
          value={form.identifier}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className={styles.authInput}
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className={styles.authButton}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
      <div className={styles.authFooter}>
        Don’t have an account?
        <Link href="/auth/signup" className={styles.authLink}>
          Sign Up
        </Link>
      </div>
      <div className={styles.authFooter} style={{ marginTop: "1rem" }}>
        Or continue with:
        <div style={{ marginTop: "0.5rem" }}>
          <button
            className={styles.authButton}
            style={{ backgroundColor: "#DB4437" }}
            onClick={() => signIn("google")}
          >
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
