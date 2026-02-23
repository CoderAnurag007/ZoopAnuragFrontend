"use client";

import React from "react";
import Link from "next/link";
import styles from "../../styles/dashboard.module.css";

const Page = () => {
  const totalProducts = 24;
  const isSessionActive = true;
  const sessionDuration = "2h 14m";

  const analytics = [
    {
      label: "Total views",
      value: "1,842",
      change: "+12.4%",
      positive: true,
      icon: "👁",
    },
    {
      label: "Sales this week",
      value: "18",
      change: "+8",
      positive: true,
      icon: "🛒",
    },
    {
      label: "Revenue",
      value: "₹24,560",
      change: "+18.2%",
      positive: true,
      icon: "💰",
    },
    {
      label: "Avg. session",
      value: "4m 32s",
      change: "-0.2m",
      positive: false,
      icon: "⏱",
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.badge}>Seller dashboard</span>
            <h1 className={styles.title}>Overview</h1>
            <p className={styles.subtitle}>
              Here’s what’s happening with your store today.
            </p>
          </div>
          <Link href="/sell/golive" className={styles.goLiveBtn}>
            <span className={styles.goLiveIcon} aria-hidden>
              ●
            </span>
            Go Live
          </Link>
        </header>

        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <div className={`${styles.iconWrap} ${styles.iconProducts}`}>
              📦
            </div>
            <div className={styles.cardLabel}>Total products</div>
            <div className={styles.cardValue}>{totalProducts}</div>
            <p className={styles.cardHint}>Listed in your catalog</p>
          </div>

          <div className={styles.card}>
            <div
              className={`${styles.iconWrap} ${
                isSessionActive
                  ? styles.iconSession
                  : styles.iconSessionInactive
              }`}
            >
              {isSessionActive ? "🔴" : "⚪"}
            </div>
            <div className={styles.cardLabel}>Active session</div>
            <div className={styles.cardValue}>
              {isSessionActive ? "Live" : "Idle"}
            </div>
            <span
              className={`${styles.statusPill} ${
                isSessionActive ? styles.statusLive : styles.statusIdle
              }`}
            >
              {isSessionActive
                ? `Live · ${sessionDuration}`
                : "No active stream"}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <h2 className={styles.sectionTitle}>Basic analytics</h2>
        <div className={styles.analyticsGrid}>
          {analytics.map((item, i) => (
            <div key={i} className={styles.analyticsCard}>
              <div className={styles.analyticsLabel}>{item.label}</div>
              <div className={styles.analyticsValue}>{item.value}</div>
              <div className={styles.analyticsChange}>
                <span
                  className={
                    item.positive
                      ? styles.analyticsChangePositive
                      : styles.analyticsChangeNegative
                  }
                >
                  {item.change}
                </span>
                <span className={styles.analyticsChangeNeutral}>
                  {" "}
                  vs last week
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
