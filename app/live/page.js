"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/live.module.css";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const REACTIONS = [
  { type: "heart", emoji: "❤️", key: "love" },
  { type: "like", emoji: "👍", key: "like" },
  { type: "fire", emoji: "🔥", key: "fire" },
];

export default function LivePage() {
  const socketRef = useRef(null);
  const [gates, setGates] = useState([]);
  const [liveSellers, setLiveSellers] = useState([]);
  const [gateId, setGateId] = useState(null);
  const [fullscreenLive, setFullscreenLive] = useState(null);
  const [liveDetail, setLiveDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [reactionCounts, setReactionCounts] = useState({
    love: 0,
    like: 0,
    fire: 0,
  });
  const [viewerName, setViewerName] = useState("");
  const [LiveDuration, setLiveDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGateId(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("gateId="))
          ?.split("=")[1] || null,
      );
      setViewerName(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("userName="))
          ?.split("=")[1] || "Guest",
      );
    }
  }, []);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.warn(
        "[Live] NEXT_PUBLIC_API_URL not set – socket will not connect to backend",
      );
    }
    const socket = io(apiUrl || "http://localhost:4000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Live] Socket connected", socket.id, "to", apiUrl);
    });
    socket.on("connect_error", (err) => {
      console.warn("[Live] Socket connect_error", err.message);
    });
    socket.on("disconnect", (reason) => {
      console.log("[Live] Socket disconnected", reason);
    });

    socket.on("liveStarted", () => getLiveSellers());
    socket.on("liveUpdated", () => getLiveSellers());
    socket.on("liveStopped", () => getLiveSellers());

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);
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
      const gateList = response.data.gates || [];
      setGates(gateList);
      if (gateList.length > 0) {
        setGateId(gateList[0]._id);
        document.cookie = `gateId=${gateList[0]._id}; path=/`;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch gates");
    }
  };
  const getLiveSellers = async () => {
    try {
      const currentGateId =
        typeof window !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("gateId="))
              ?.split("=")[1] || gateId
          : gateId;
      if (!currentGateId) return;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/live/getactivelivesellers?gateId=${currentGateId}`,
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
      setLiveSellers(response.data.liveSellers);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch live sellers");
    }
  };
  useEffect(() => {
    getGates();
  }, []);
  useEffect(() => {
    if (!gateId) return;
    getLiveSellers();
  }, [gateId]);
  function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }
  const [openedSeller, setOpenedSeller] = useState(null);
  const [openedProduct, setOpenedProduct] = useState(null);
  const getLiveDetail = async (liveId) => {
    setLoadingDetail(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/live/getlive?liveId=${liveId}`,
        {
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined"
                ? document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("token="))
                    ?.split("=")[1]
                : ""
            }`,
          },
        },
      );
      const live = response.data.liveSeller || response.data.live;
      const seller = response.data.seller;
      const product = response.data.displayProduct;
      setOpenedSeller(seller || null);
      setOpenedProduct(product || null);
      setLiveDetail(live);
      let liveDuration =
        new Date() - new Date(response.data.live.liveStartTime);
      setLiveDuration(Math.floor(liveDuration / 1000));
      setReactionCounts({
        love:
          live?.reactions?.find((reaction) => reaction.reaction === "love")
            ?.count ?? 0,
        like:
          live?.reactions?.find((reaction) => reaction.reaction === "like")
            ?.count ?? 0,
        fire:
          live?.reactions?.find((reaction) => reaction.reaction === "fire")
            ?.count ?? 0,
      });
      setComments([]);
      try {
        const commentRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/comment?liveId=${liveId}`,
        );
        setComments(commentRes.data.comments || []);
      } catch (e) {
        console.error("Failed to load comments", e);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load live");
      setFullscreenLive(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openFullscreen = (seller) => {
    setFullscreenLive(seller);
    setLiveDetail(null);
    setOpenedProduct(null);
    setOpenedSeller(null);
    getLiveDetail(seller._id);
  };

  useEffect(() => {
    if (!fullscreenLive || !socketRef.current) return;
    const socket = socketRef.current;
    const liveId = fullscreenLive._id;
    const onProductUpdated = (payload) => {
      console.log("[Live] productUpdated received", payload?.id, payload);
      setOpenedProduct((prev) => {
        if (!prev) return prev;
        const prevId = prev.id ?? prev._id;
        const payloadId = payload?.id ?? payload?._id;
        if (prevId == null || payloadId == null) return prev;
        if (String(prevId) !== String(payloadId)) return prev;
        return {
          ...prev,
          ...payload,
          id: payloadId,
          _id: payloadId,
        };
      });
    };
    socket.on("productUpdated", onProductUpdated);

    socket.emit("joinLive", { liveId });
    const onViewerCountUpdate = (count) => setViewerCount(count);
    socket.on("viewerCountUpdate", onViewerCountUpdate);
    const onComment = (payload) => {
      if (String(payload.liveId) !== String(liveId)) return;
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
    socket.on("liveComment", onComment);
    return () => {
      socket.off("viewerCountUpdate", onViewerCountUpdate);
      socket.off("liveComment", onComment);
      socket.off("productUpdated", onProductUpdated);
    };
  }, [fullscreenLive]);

  useEffect(() => {
    if (!fullscreenLive) return;
    const interval = setInterval(() => {
      setLiveDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [fullscreenLive]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    const text = commentInput.trim();
    if (!text || !fullscreenLive?._id) return;
    const token =
      typeof window !== "undefined"
        ? document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1]
        : null;
    if (!token) {
      toast.error("Please sign in to comment");
      return;
    }
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comment`,
        {
          liveId: fullscreenLive._id,
          text,
          userName: viewerName !== "Guest" ? viewerName : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCommentInput("");
      toast.success("Comment posted");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to post comment");
    }
  };

  const handleReaction = async (key) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reaction/like/${key}`,
        {
          liveId: fullscreenLive._id,
          type: key,
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
      // setReactionCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
      let reactioncountsupdated = response.data.liveSeller.reactions;
      setReactionCounts({
        love:
          reactioncountsupdated?.find(
            (reaction) => reaction.reaction === "love",
          )?.count ?? 0,
        like:
          reactioncountsupdated?.find(
            (reaction) => reaction.reaction === "like",
          )?.count ?? 0,
        fire:
          reactioncountsupdated?.find(
            (reaction) => reaction.reaction === "fire",
          )?.count ?? 0,
      });
      toast.success("Reaction sent");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reaction");
    }
  };

  const closeFullscreen = () => {
    setFullscreenLive(null);
    setLiveDetail(null);
    setOpenedProduct(null);
    setOpenedSeller(null);
    setComments([]);
    setCommentInput("");
    setViewerCount(0);
  };

  const sellerDisplayName =
    openedSeller?.name ||
    openedSeller?.username ||
    fullscreenLive?.sellerId?.name ||
    "Seller";
  const sellerHandle = openedSeller?.email
    ? `@${openedSeller.email.split("@")[0]}`
    : fullscreenLive?.sellerId?.email
      ? `@${fullscreenLive.sellerId.email.split("@")[0]}`
      : "@seller";
  const sellerAvatar =
    openedSeller?.avatar ||
    openedSeller?.liveThumbnail ||
    "https://i.pravatar.cc/80?img=1";

  const productImageUrl =
    openedProduct?.imageUrl ||
    openedSeller?.liveThumbnail ||
    fullscreenLive?.liveThumbnail;

  return (
    <div className={styles.page}>
      <div className={styles.gateSwitcher}>
        {gates.length > 0 &&
          gates.map((gate) => (
            <button
              key={gate._id}
              type="button"
              className={`${styles.gateSignBtn} ${gateId === gate._id ? styles.gateSignBtnActive : ""}`}
              onClick={() => {
                setGateId(gate._id);
                document.cookie = `gateId=${gate._id}; path=/`;
              }}
              aria-pressed={gateId === gate._id}
              aria-label={`${gate.name} - ${gate.description}`}
            >
              <span className={styles.gateSignLabel}>{gate.name}</span>
              <span className={styles.gateSignCategory}>
                {gate.description}
              </span>
            </button>
          ))}
      </div>

      {/* 9:16 Insta-style live cards */}
      <section className={styles.cardsGrid} aria-label="Live sellers">
        {liveSellers.length > 0 &&
          liveSellers.map((seller) => (
            <article
              key={seller._id}
              className={styles.card}
              role="button"
              tabIndex={0}
              onClick={() => openFullscreen(seller)}
              onKeyDown={(e) => e.key === "Enter" && openFullscreen(seller)}
            >
              <div className={styles.thumbnailWrap}>
                <img
                  src={seller.liveThumbnail}
                  alt={`${seller.sellerId?.name || seller.username || "Seller"} live`}
                  className={styles.thumbnail}
                />
              </div>
              <div className={styles.overlay} aria-hidden />
              <span className={styles.liveBadge}>
                <span className={styles.liveDot} />
                Live
              </span>
              <div className={styles.bottomBar}>
                <img
                  src={
                    seller.sellerId?.avatar ||
                    seller.liveThumbnail ||
                    "https://i.pravatar.cc/80?img=1"
                  }
                  alt=""
                  className={styles.sellerAvatar}
                />
                <div className={styles.sellerInfo}>
                  <p className={styles.username}>
                    {seller.sellerName || seller.username || "Seller"}
                  </p>
                  <p className={styles.handle}>
                    {seller.sellerEmail
                      ? `@${seller.sellerEmail.split("@")[0]}`
                      : seller.handle || "@seller"}
                  </p>
                </div>
              </div>
            </article>
          ))}
      </section>

      {/* Fullscreen live viewer */}
      {fullscreenLive && (
        <div
          className={styles.fullscreenOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Live stream viewer"
        >
          <div className={styles.fullscreenContent}>
            <button
              type="button"
              className={styles.fullscreenClose}
              onClick={closeFullscreen}
              aria-label="Close live"
            >
              ✕
            </button>

            <div className={styles.viewerMain}>
              <div
                className={styles.videoArea}
                style={
                  !loadingDetail && liveDetail?.liveThumbnail
                    ? {
                        backgroundImage: `url(${liveDetail?.liveThumbnail})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {loadingDetail ? (
                  <div className={styles.videoPlaceholder}>
                    <span className={styles.loadingText}>Loading live…</span>
                  </div>
                ) : !productImageUrl ? (
                  <div className={styles.videoPlaceholder}>
                    <span className={styles.loadingText}>No preview</span>
                  </div>
                ) : null}
                <span className={styles.liveBadgeTop}>
                  <span className={styles.liveDot} />
                  Live
                </span>
                <span className={styles.viewerCount}>
                  {viewerCount} watching
                </span>
                <span className={styles.liveDuration}>
                  {formatDuration(LiveDuration)}
                </span>

                <div className={styles.sellerBar}>
                  <img
                    src={sellerAvatar}
                    alt=""
                    className={styles.sellerAvatarLarge}
                  />
                  <div className={styles.sellerMeta}>
                    <span className={styles.sellerName}>
                      {sellerDisplayName}
                    </span>
                    <span className={styles.sellerHandle}>{sellerHandle}</span>
                  </div>
                </div>
                {openedProduct && (
                  <div className={styles.productCardOverlay}>
                    {openedProduct.imageUrl && (
                      <img
                        src={openedProduct.imageUrl}
                        alt=""
                        className={styles.productCardOverlayImg}
                      />
                    )}
                    <div className={styles.productCardOverlayInfo}>
                      <span className={styles.productCardOverlayName}>
                        {openedProduct.name}
                      </span>
                      <span className={styles.productCardOverlayPrice}>
                        ₹
                        {Number(openedProduct.price)?.toLocaleString?.() ??
                          openedProduct.price}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.viewerSidebar}>
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>
                    {liveDetail?.liveTitle ||
                      fullscreenLive?.liveTitle ||
                      "Live"}
                  </h3>
                  <p className={styles.sidebarDesc}>
                    {liveDetail?.liveDescription ||
                      fullscreenLive?.liveDescription ||
                      "Watch and interact below."}
                  </p>
                </div>

                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>Reactions</h3>
                  <div className={styles.reactionsRow}>
                    {REACTIONS.map((r) => (
                      <button
                        key={r.type}
                        type="button"
                        className={styles.reactionBtn}
                        onClick={() => handleReaction(r.key)}
                        aria-label={`Send ${r.type}`}
                      >
                        <span className={styles.reactionEmoji}>{r.emoji}</span>
                        <span className={styles.reactionCount}>
                          {reactionCounts[r.key] ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>Comments</h3>
                  <form
                    className={styles.questionForm}
                    onSubmit={handlePostComment}
                  >
                    <input
                      type="text"
                      placeholder="Add a comment…"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className={styles.questionInput}
                      maxLength={500}
                      aria-label="Add comment"
                    />
                    <button
                      type="submit"
                      className={styles.questionSubmit}
                      disabled={!commentInput.trim()}
                    >
                      Post
                    </button>
                  </form>
                  <div className={styles.questionsList}>
                    {comments.length === 0 ? (
                      <p className={styles.questionsEmpty}>
                        No comments yet. Be the first!
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c._id} className={styles.questionItem}>
                          <p className={styles.questionText}>{c.text}</p>
                          <p className={styles.questionMeta}>
                            {c.userName || "Viewer"} ·{" "}
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleTimeString(
                                  undefined,
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "Just now"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
