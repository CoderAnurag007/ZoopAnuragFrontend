"use client";
import { useState, useEffect } from "react";
import Land from "./components/Land";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [token, setToken] = useState(null);
  const router = useRouter();

  return (
    <div className={styles.page}>
      <Land />
    </div>
  );
}
