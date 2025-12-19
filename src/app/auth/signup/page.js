"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "@/styles/Auth.module.css";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/register", form);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: res.data.message,
      }).then(() => {
        window.location.href = "/auth/login";
      });

      setForm({ email: "", password: "", confirmPassword: "" });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.email && form.password.length >= 6 && form.password === form.confirmPassword;

  return (
    <div className={styles.authContainer}>
      <h1 className={styles.authTitle}>Sign Up</h1>

      <form className={styles.authForm} onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className={styles.authInput}
          value={form.email}
          onChange={handleChange}
          required
        />

        {/* Password Field */}
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword.password ? "text" : "password"}
            name="password"
            placeholder="Password"
            className={styles.authInput}
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => togglePassword("password")}
          >
            {showPassword.password ? "👁️" : "🙈"}
          </button>
        </div>

        {/* Confirm Password Field */}
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword.confirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            className={styles.authInput}
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => togglePassword("confirmPassword")}
          >
            {showPassword.confirmPassword ? "👁️" : "🙈"}
          </button>
        </div>

        <button
          type="submit"
          className={styles.authButton}
          disabled={!isFormValid || loading}
          style={{ opacity: !isFormValid ? 0.6 : 1 }}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      <div className={styles.authFooter}>
        Already have an account?{" "}
        <Link href="/auth/login" className={styles.authLink}>
          Login
        </Link>
      </div>
    </div>
  );
}
