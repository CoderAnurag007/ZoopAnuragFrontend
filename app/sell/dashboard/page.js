"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/dashboard.module.css";
import axios from "axios";

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError(null);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`,
          { headers: getAuthHeaders() },
        );
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load dashboard",
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.badge}>Seller dashboard</span>
              <h1 className={styles.title}>Overview</h1>
            </div>
          </div>
          <p className={styles.subtitle}>Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.badge}>Seller dashboard</span>
              <h1 className={styles.title}>Overview</h1>
            </div>
          </div>
          <p className={styles.subtitle} style={{ color: "#b91c1c" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  const totalProducts = data?.totalProducts ?? 0;
  const liveSession = data?.liveSession ?? { active: false, duration: null };
  const totalViews = data?.totalViews ?? 0;

  const analytics = [];
  if (typeof totalViews === "number") {
    analytics.push({
      label: "Total views",
      value: totalViews.toLocaleString(),
      icon: "👁",
    });
  }

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
                liveSession.active
                  ? styles.iconSession
                  : styles.iconSessionInactive
              }`}
            >
              {liveSession.active ? "🔴" : "⚪"}
            </div>
            <div className={styles.cardLabel}>Active session</div>
            <div className={styles.cardValue}>
              {liveSession.active ? "Live" : "Idle"}
            </div>
            <span
              className={`${styles.statusPill} ${
                liveSession.active ? styles.statusLive : styles.statusIdle
              }`}
            >
              {liveSession.active
                ? `Live · ${liveSession.duration || "—"}`
                : "No active stream"}
            </span>
          </div>
        </div>

        {analytics.length > 0 && (
          <>
            <div className={styles.divider} />
            <h2 className={styles.sectionTitle}>Basic analytics</h2>
            <div className={styles.analyticsGrid}>
              {analytics.map((item, i) => (
                <div key={i} className={styles.analyticsCard}>
                  <div className={styles.analyticsLabel}>{item.label}</div>
                  <div className={styles.analyticsValue}>{item.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
