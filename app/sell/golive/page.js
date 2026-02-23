"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../../styles/golive.module.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import jwt from "jsonwebtoken";
import { io } from "socket.io-client";
const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Wireless Earbuds Pro",
    price: "2499",
    imageUrl:
      "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Organic Cotton T-Shirt",
    price: "899",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Stainless Steel Bottle",
    price: "1299",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542e6b42?w=200&h=200&fit=crop",
  },
];

// Match backend LiveSellers.reactions: like, love, fire (same as api/reaction and live viewer page)
const REACTIONS = [
  { type: "love", emoji: "❤️", style: styles.reactionChipHeart },
  { type: "like", emoji: "👍", style: styles.reactionChipLike },
  { type: "fire", emoji: "🔥", style: styles.reactionChipFire },
];

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function GoLivePage() {
  const [isLive, setIsLive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [reactionCounts, setReactionCounts] = useState(
    REACTIONS.reduce((acc, r) => ({ ...acc, [r.type]: 0 }), {}),
  );
  const [products, setProducts] = useState([]);
  const [gates, setGates] = useState([]);
  const [activeLive, setActiveLive] = useState(null);
  const [gateId, setGateId] = useState("");
  const [liveThumbnail, setLiveThumbnail] = useState("");
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDescription, setLiveDescription] = useState("");
  const [analytics, setAnalytics] = useState({
    viewers: 0,
    peakViewers: 0,
    clicks: 0,
    cartAdds: 0,
  });
  const [viewersCount, setViewersCount] = useState(0);
  const socketRef = useRef(null);
  const activeLiveRef = useRef(activeLive);
  useEffect(() => {
    activeLiveRef.current = activeLive;
  }, [activeLive]);

  useEffect(() => {
    if (!isLive || !activeLive) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    socketRef.current = socket;

    const onViewerCountUpdate = (count) => {
      setViewersCount(typeof count === "number" ? count : Number(count) || 0);
    };
    const onComment = (payload) => {
      const currentLiveId = activeLiveRef.current;
      if (!payload || !currentLiveId) return;
      if (String(payload.liveId) !== String(currentLiveId)) return;
      setComments((c) => {
        if (c.some((x) => String(x._id) === String(payload._id))) return c;
        return [
          {
            _id: payload._id,
            text: payload.text,
            userName: payload.userName || "Viewer",
            createdAt: payload.createdAt,
          },
          ...c,
        ];
      });
    };
    const onReactionAdded = (payload) => {
      const currentLiveId = activeLiveRef.current;
      if (!payload || !currentLiveId) return;
      if (String(payload.liveId) !== String(currentLiveId)) return;
      const reaction = payload?.reaction;
      if (reaction) {
        setReactionCounts((prev) => ({
          ...prev,
          [reaction]: (prev[reaction] ?? 0) + 1,
        }));
      }
    };
    socket.on("viewerCountUpdate", onViewerCountUpdate);
    socket.on("liveComment", onComment);
    socket.on("reactionAdded", onReactionAdded);

    const joinRoom = () => {
      const id = activeLiveRef.current;
      if (id) socket.emit("joinLive", { liveId: String(id) });
    };
    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    return () => {
      socket.off("viewerCountUpdate", onViewerCountUpdate);
      socket.off("liveComment", onComment);
      socket.off("reactionAdded", onReactionAdded);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLive, activeLive]);
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            }`,
          },
        },
      );
      console.log(response.data);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getGates = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/live/getgates`,
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            }`,
          },
        },
      );
      setGates(response.data.gates || []);
      if (response.data.gates?.length > 0 && !gateId) {
        setGateId(response.data.gates[0]._id);
      }
    } catch (error) {
      console.error("Error fetching gates:", error);
    }
  };

  useEffect(() => {
    getProducts();
    getGates();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setLiveThumbnail((prev) => prev || selectedProduct.imageUrl || "");
      setLiveTitle((prev) => prev || selectedProduct.name || "");
      setLiveDescription((prev) => prev || selectedProduct.description || "");
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!isLive) return;
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [isLive]);

  const handleStartLive = async () => {
    if (!liveThumbnail || !liveTitle || !gateId) {
      toast.error("Please fill the required fields");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a product to showcase");
      return;
    }

    const token =
      typeof window !== "undefined"
        ? document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1]
        : null;
    const decoded = token ? jwt.decode(token) : null;
    const sellerId = decoded?.userId;
    setIsLive(true);
    setDuration(0);
    setViewersCount(0);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/live/startlive`,
        {
          sellerId,
          gateId,
          liveThumbnail: liveThumbnail || selectedProduct?.imageUrl || "",
          liveTitle: liveTitle || selectedProduct?.name || "",
          liveDescription:
            liveDescription || selectedProduct?.description || "",
          liveStartTime: new Date().toISOString(),
          liveEndTime: null,
          displayProduct: selectedProduct || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const newLiveId = response.data?.liveSeller?._id;
      if (newLiveId) {
        setActiveLive(newLiveId);
        const reactions = response.data?.liveSeller?.reactions || [];
        setReactionCounts((prev) => {
          const next = { ...prev };
          REACTIONS.forEach((r) => {
            const item = reactions.find((x) => x.reaction === r.type);
            next[r.type] = item?.count ?? 0;
          });
          return next;
        });
      }
      toast.success("Live session started successfully");
    } catch (error) {
      setIsLive(false);
      toast.error("Error starting live session");
      console.error("Error starting live session:", error);
    }
  };

  const handleStopLive = async (activeLive) => {
    try {
      console.log(activeLive, "Active live");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/live/stoplive`,
        {
          liveId: activeLive,
        },
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            }`,
          },
        },
      );
      toast.success("Live session stopped successfully");
      setIsLive(false);
      setViewersCount(0);
      setComments([]);
    } catch (error) {
      console.error("Error stopping live session:", error);
      toast.error("Error stopping live session");
    }
  };
  const [liveProduct, setLiveProduct] = useState(null);
  useEffect(() => {
    if (liveProduct && products.length > 0) {
      console.log(liveProduct, products, "Live product");
      let product = products.find((product) => product.id === liveProduct);
      setSelectedProduct(product);
    }
  }, [liveProduct, products]);
  const getLiveSession = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/live/getlivesession`,
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            }`,
          },
        },
      );
      console.log(response.data);
      setActiveLive(response.data.live._id);
      setIsLive(response.data.live.isLive);
      setLiveThumbnail(response.data.live.liveThumbnail);
      setLiveTitle(response.data.live.liveTitle);
      setLiveDescription(response.data.live.liveDescription);
      const reactions = response.data.live.reactions || [];
      setReactionCounts((prev) => {
        const next = { ...prev };
        REACTIONS.forEach((r) => {
          const item = reactions.find((x) => x.reaction === r.type);
          next[r.type] = item?.count ?? 0;
        });
        return next;
      });
      setLiveProduct(response.data.live.displayProduct);
      let liveDuration =
        new Date() - new Date(response.data.live.liveStartTime);
      setDuration(Math.floor(liveDuration / 1000));
      toast.success("Live session fetched successfully");
    } catch (error) {
      console.error("Error getting live session:", error);
      toast.error("Error getting live session");
    }
  };

  useEffect(() => {
    getLiveSession();
  }, []);

  // Fetch comments when live is active
  useEffect(() => {
    if (!isLive || !activeLive) return;
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/comment?liveId=${activeLive}`,
        );
        setComments(res.data.comments || []);
      } catch (e) {
        console.error("Failed to fetch comments", e);
      }
    };
    fetchComments();
  }, [isLive, activeLive]);

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
      />
      <div className={styles.container}>
        <Link href="/sell/dashboard" className={styles.linkBack}>
          ← Back to dashboard
        </Link>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.badge}>Control room</span>
            <h1 className={styles.title}>Go Live</h1>
            <p className={styles.subtitle}>
              Start your session, pick a product to showcase, and monitor
              comments & reactions in real time.
            </p>
          </div>
          <div className={styles.sessionBar}>
            <span
              className={
                isLive
                  ? `${styles.liveIndicator} ${styles.liveIndicatorOn}`
                  : `${styles.liveIndicator} ${styles.liveIndicatorOff}`
              }
            >
              {isLive && <span className={styles.liveDot} aria-hidden />}
              {isLive ? `Live · ${formatDuration(duration)}` : "Offline"}
            </span>
            {!isLive ? (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnStart}`}
                onClick={handleStartLive}
              >
                <span aria-hidden>●</span> Start live session
              </button>
            ) : (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnStop}`}
                onClick={() => handleStopLive(activeLive)}
              >
                End live session
              </button>
            )}
          </div>
        </header>

        <div className={styles.mainGrid}>
          <div>
            <div className={styles.previewCard}>
              <div className={styles.previewLabel}>Product showcase</div>
              <div className={styles.showcaseRow}>
                <div
                  style={{
                    width: "320px",
                  }}
                  className={styles.previewStage}
                >
                  {!isLive ? (
                    <div className={styles.previewPlaceholder}>
                      Start live to show product to viewers
                    </div>
                  ) : selectedProduct ? (
                    <div className={styles.productCardOverlay}>
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className={styles.productCardOverlayImg}
                      />
                      <div className={styles.productCardOverlayInfo}>
                        <p className={styles.productCardOverlayName}>
                          {selectedProduct.name}
                        </p>
                        <p className={styles.productCardOverlayPrice}>
                          ₹
                          {Number(selectedProduct.price).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.previewPlaceholder}>
                      Select a product below to showcase
                    </div>
                  )}
                </div>
                <div className={styles.showcaseForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="gateId">
                      Gate <span style={{ color: "red" }}>*</span>{" "}
                    </label>
                    <select
                      id="gateId"
                      className={styles.formSelect}
                      value={gateId}
                      onChange={(e) => setGateId(e.target.value)}
                      disabled={isLive}
                    >
                      <option value="">Select a gate </option>
                      {gates.map((gate) => (
                        <option key={gate._id} value={gate._id}>
                          {gate.name}
                          {gate.description ? ` – ${gate.description}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="liveThumbnail">
                      Live thumbnail (URL){" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      id="liveThumbnail"
                      type="url"
                      className={styles.formInput}
                      placeholder="https://..."
                      value={liveThumbnail}
                      onChange={(e) => setLiveThumbnail(e.target.value)}
                      disabled={isLive}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="liveTitle">
                      Live title <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      id="liveTitle"
                      type="text"
                      className={styles.formInput}
                      placeholder="Title for your live"
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      disabled={isLive}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label
                      className={styles.formLabel}
                      htmlFor="liveDescription"
                    >
                      Live description <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      id="liveDescription"
                      className={styles.formTextarea}
                      placeholder="Describe your live session"
                      value={liveDescription}
                      onChange={(e) => setLiveDescription(e.target.value)}
                      rows={3}
                      disabled={isLive}
                    />
                  </div>
                  {selectedProduct && (
                    <p className={styles.formHint}>
                      Selected product will be sent as displayProduct when you
                      start live.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.productSection}>
              <h2 className={styles.sectionTitle}>
                📦 Select product to showcase
              </h2>
              <div className={styles.productList}>
                {products.length > 0 &&
                  products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className={`${styles.productItem} ${
                        selectedProduct?.id === product.id
                          ? styles.productItemActive
                          : ""
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <img
                        src={product.imageUrl}
                        alt=""
                        className={styles.productThumb}
                      />
                      <div className={styles.productItemInfo}>
                        <div className={styles.productItemName}>
                          {product.name}
                        </div>
                        <div className={styles.productItemPrice}>
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>
                          Stock: {Number(product.stock).toLocaleString("en-IN")}
                        </div>
                      </div>
                      {selectedProduct?.id === product.id && (
                        <span className={styles.btnUpdateProduct}>Showing</span>
                      )}
                    </button>
                  ))}
              </div>
              {isLive && selectedProduct && (
                <p
                  className={styles.subtitle}
                  style={{ marginTop: "0.75rem", marginBottom: 0 }}
                >
                  Click another product to update what viewers see during the
                  live.
                </p>
              )}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                Comments
                <span className={styles.panelBadge}>{comments.length}</span>
              </div>
              <div className={styles.questionsList}>
                {isLive && comments.length > 0 ? (
                  comments.map((c) => (
                    <div key={c._id} className={styles.questionItem}>
                      <p className={styles.questionText}>{c.text}</p>
                      <p className={styles.questionMeta}>
                        {c.userName || "Viewer"} ·{" "}
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleTimeString(
                              undefined,
                              { hour: "2-digit", minute: "2-digit" },
                            )
                          : "Just now"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    {isLive
                      ? "No comments yet. They’ll appear here as viewers post."
                      : "Comments appear here when you’re live."}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>Reactions</div>
              <div className={styles.reactionsRow}>
                {REACTIONS.map((r) => (
                  <span
                    key={r.type}
                    className={`${styles.reactionChip} ${r.style}`}
                  >
                    {r.emoji} {reactionCounts[r.type] ?? 0}
                  </span>
                ))}
              </div>
              {!isLive && (
                <div className={styles.emptyState}>
                  Reaction counts update in real time when you’re live.
                </div>
              )}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>Real-time analytics</div>
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsItem}>
                  <div className={styles.analyticsValue}>
                    {isLive ? viewersCount : "—"}
                  </div>
                  <div className={styles.analyticsLabel}>Viewers now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
