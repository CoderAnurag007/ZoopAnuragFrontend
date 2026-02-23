import React from "react";
import styles from "../styles/main.module.css";
import Image from "next/image";
const Spinner = () => {
  return (
    <span>
      <Image src="/loading.gif" alt="spinner" width={20} height={20} />
    </span>
  );
};

export default Spinner;
