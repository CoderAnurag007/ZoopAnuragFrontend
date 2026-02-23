"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/auth.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";

const Signup = () => {
  const searchParams = useSearchParams();
  const isSeller = searchParams.get("seller") === "true";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setloading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("signup", process.env.NEXT_PUBLIC_API_URL, isSeller);
    setloading(true);
    if (isSeller) {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          email,
          password,
          seller: true,
          name: `${firstName} ${lastName}`,
        },
      );
      if (response.status == 200) {
        console.log("success");
        toast.success("Account created successfully");
        // window.localStorage.setItem("token", response.data.token);
        document.cookie = `token=${response.data.token}; path=/`;
        router.push("/live");
        setloading(false);
      } else {
        setloading(false);
        const buyerResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
          {
            email,
            password,
            seller: false,
            name: `${firstName} ${lastName}`,
          },
        );
        toast.error(buyerResponse.data.message);
        if (buyerResponse.status == 200) {
          console.log("buyer success");
          toast.success("Account created successfully");
          // window.localStorage.setItem("token", buyerResponse.data.token);
          document.cookie = `token=${buyerResponse.data.token}; path=/`;
          router.push("/live");
        } else {
          console.log("buyer error");
          console.log(buyerResponse.data);
          toast.error(buyerResponse.data.message);
          setloading(false);
        }
      }
      console.log(response.data);
    } else {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          email,
          password,
          seller: false,
          name: `${firstName} ${lastName}`,
        },
      );
      console.log(response.data);
      if (response.status == 200) {
        console.log("success");
        toast.success("Account created successfully");
        // window.localStorage.setItem("token", response.data.token);
        document.cookie = `token=${response.data.token}; path=/`;
        router.push("/live");
      } else {
        toast.error(response.data.message);
      }
    }
  };

  const loginHref = isSeller ? "/login?seller=true" : "/login";
  const switchHref = isSeller ? "/signup" : "/signup?seller=true";

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
            {isSeller ? "Seller" : "Buyer"}
          </span>
          <h1 className={styles.title}>
            {isSeller ? "Create seller account" : "Create account"}
          </h1>
          <p className={styles.subtitle}>
            {isSeller
              ? "Start selling and managing your store"
              : "Join to shop and place orders"}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.signupNameRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="signup-first">
                First name
              </label>
              <input
                id="signup-first"
                type="text"
                className={styles.input}
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="signup-last">
                Last name
              </label>
              <input
                id="signup-last"
                type="text"
                className={styles.input}
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
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
            <label className={styles.label} htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
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
            Create account {loading ? <Spinner /> : null}
          </button>
        </form>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?
            <Link href={loginHref} className={styles.footerLink}>
              Sign in
            </Link>
          </p>
          <div className={styles.switchRole}>
            <Link href={switchHref} className={styles.switchRoleLink}>
              {isSeller
                ? "Signing up as a buyer? Switch to buyer signup"
                : "Are you a seller? Create seller account"}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Signup;
