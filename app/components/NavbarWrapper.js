"use client";

import React from 'react'
import dynamic from "next/dynamic";
const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

export default function NavbarWrapper({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  )
}