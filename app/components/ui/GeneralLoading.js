"use client";
import React from "react";

const GeneralLoading = () => {
  return (
    <div className="vh-100 d-flex flex-column justify-content-start align-items-center pt-5">
      <div className="loading-dots">
        <p className="loading-text">صفحه در حال بارگذاری، لطفا منتظر بمانید</p>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default GeneralLoading;
