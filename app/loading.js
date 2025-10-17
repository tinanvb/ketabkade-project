"use client";

import Lottie from "lottie-react";
import animationData from "@/app/animations/pageLoader.json";

export default function Loading() {
  return (
    <div
      className="d-flex justify-content-center align-items-center bg-white"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
      }}
    >
      <Lottie animationData={animationData} loop={true} style={{ width: 250, height: 250 }} />
    </div>
  );
}