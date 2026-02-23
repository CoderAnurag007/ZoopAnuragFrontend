"use client";

import React from "react";
import Link from "next/link";
import styles from "../styles/main.module.css";

const Main = () => {
  return (
    <main className={styles.hero} role="main">
      <div className={styles.heroBg} aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>
      <div className={styles.heroContent}>
        <h1 className={styles.headline}>
          Your marketplace.
          <br />
          <span className={styles.headlineAccent}>Shop or sell.</span>
        </h1>
        <p className={styles.subline}>
          Discover products from thousands of sellers, or list your own and
          reach buyers everywhere.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/live" className={styles.btnPrimary}>
            Start shopping
          </Link>
          <Link href="/login?seller=true" className={styles.btnSecondary}>
            Start selling
          </Link>
        </div>
      </div>
      <div className={styles.heroVisual} aria-hidden="true">
        <div className={styles.visualCard} />
        <div className={styles.visualCard} />
        <div className={styles.visualCard} />
      </div>
    </main>
  );
};

export default Main;
