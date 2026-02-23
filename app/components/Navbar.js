"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/navbar.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsBrowser(true);
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET);
      setUser({
        id: decoded.userId,
        role: decoded.role,
      });
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    setUser(null);
    router.push("/login");
  };

  const isSeller = user?.role === "seller";

  return (
    <header className={styles.navbar} role="banner">
      <Link href="/" className={styles.brand} aria-label="Zoop home">
        <span className={styles.brandText}>
          {" "}
          <span style={{ color: "var(--color-primary)" }}>Zoop X</span> Anurag
        </span>
      </Link>

      <nav className={styles.nav} aria-label="Main navigation">
        {isSeller ? (
          <>
            <Link href="/sell/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <Link href="/sell/products" className={styles.navLink}>
              Products
            </Link>
            <Link href="/sell/golive" className={styles.navLink}>
              Go Live
            </Link>
            <Link href="/shop" className={styles.navLink}>
              Shop
            </Link>
          </>
        ) : (
          <>
            <Link href="/shop" className={styles.navLink}>
              Shop Zone
            </Link>
            <Link href="/live" className={styles.navLink}>
              Live
            </Link>
            {isBrowser && !user ? (
              <Link href="/login" className={styles.navLink}>
                Login
              </Link>
            ) : null}
            {isBrowser && !user ? (
              <Link href="/signup" className={styles.navLink}>
                Sign up
              </Link>
            ) : null}
            {!isSeller && user ? (
              <Link href="/sell" className={styles.navLink}>
                Sell on Zoop
              </Link>
            ) : null}
          </>
        )}
        {isBrowser && user && (
          <span
            onClick={handleLogout}
            className={styles.navLink}
            style={{ cursor: "pointer" }}
          >
            Log Out
          </span>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
