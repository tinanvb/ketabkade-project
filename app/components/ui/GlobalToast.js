"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GlobalToast() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar
      rtl={false}
      closeOnClick
      pauseOnHover
    />
  );
}