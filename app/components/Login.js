"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/auth.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "./Spinner";

const Login = () => {
  const searchParams = useSearchParams();
  const isSeller = searchParams.get("seller") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setloading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ email, password, isSeller });
    setloading(true);
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
          document.cookie = `user=${JSON.stringify(response.data.user)}; path=/`;
          // router.push("/live");
          typeof window !== "undefined" && (window.location.href = "/live");
          console.log("window.location.href", window.location.href);
          setloading(false);
        } else {
          toast.error(response.data.message);
          setloading(false);
        }
      } catch (error) {
        console.log("error", error);
        toast.error(error.response.data.message);
        setloading(false);
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
          document.cookie = `user=${JSON.stringify(response.data.user)}; path=/`;
          // router.push("/live");
          typeof window !== "undefined" && (window.location.href = "/live");
          setloading(false);
        } else {
          toast.error(response.data.message);
          setloading(false);
        }
      } catch (error) {
        console.log("error", error);
        toast.error(error.response.data.message);
        setloading(false);
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
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            Sign in → {loading ? <Spinner /> : null}
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
