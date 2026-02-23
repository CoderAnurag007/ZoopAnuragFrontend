"use client";

import React from "react";
import Main from "./Main";
import dynamic from "next/dynamic";
// import Navbar from "./Navbar";
// const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

const Land = () => {
  return (
    <div>
      {/* <Navbar /> */}
      <Main />
    </div>
  );
};

export default Land;
