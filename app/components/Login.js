"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/auth.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const Login = () => {
  const searchParams = useSearchParams();
  const isSeller = searchParams.get("seller") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ email, password, isSeller });
    if (isSeller) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
          {
            email,
            password,
            seller: true,
          },
        );
        if (response.status == 200) {
          toast.success("Login successful");
          // window.localStorage.setItem("token", response.data.token);
          document.cookie = `token=${response.data.token}; path=/`;
          router.push("/live");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log("error", error);
        toast.error(error.response.data.message);
      }
    } else {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
          {
            email,
            password,
            seller: false,
          },
        );

        if (response.status == 200) {
          toast.success("Login successful");
          document.cookie = `token=${response.data.token}; path=/`;
          router.push("/live");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log("error", error);
        toast.error(error.response.data.message);
      }
    }
  };

  const signupHref = isSeller ? "/signup?seller=true" : "/signup";
  const switchHref = isSeller ? "/login" : "/login?seller=true";

  return (
    <div className={styles.wrapper}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className={`${styles.card} ${isSeller ? styles.cardSeller : ""}`}>
        <header className={styles.header}>
          <span
            className={`${styles.badge} ${
              isSeller ? styles.badgeSeller : styles.badgeBuyer
            }`}
          >
            {isSeller ? "🏪 Seller" : "🛒 Buyer"}
          </span>
          <h1 className={styles.title}>
            {isSeller ? "Seller login 🚀" : "Welcome back 👋"}
          </h1>
          <p className={styles.subtitle}>
            {isSeller
              ? "Sign in to manage your listings and orders"
              : "Sign in to browse and buy "}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="login-email">
              📧 Email
            </label>
            <input
              id="login-email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="login-password">
              🔒 Password
            </label>
            <input
              id="login-password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className={`${styles.submitBtn} ${
              isSeller ? styles.submitBtnSeller : styles.submitBtnBuyer
            }`}
          >
            Sign in →
          </button>
        </form>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Link href={signupHref} className={styles.footerLink}>
              Sign up
            </Link>
          </p>
          <div className={styles.switchRole}>
            <Link href={switchHref} className={styles.switchRoleLink}>
              {isSeller
                ? "🛒 Signing in as a buyer? Switch to buyer login"
                : "🏪 Are you a seller? Sign in as seller"}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;
