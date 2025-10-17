"use client";
import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

const GeneralErrorFancy = ({ error, onRetry = null }) => {
  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <div className="fancy-error-container vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="fancy-error-card p-4 rounded shadow animate-fade-in">
        <FaExclamationTriangle size={50} className="fancy-error-icon bounce" />
        <h3 className="mt-2 mb-2"> مشکلی پیش اومده است</h3>
        <p className="mb-3">
          {error?.message || "لطفا دوباره تلاش کنید."}
        </p>{" "}
        {onRetry && (
          <button onClick={onRetry} className="retry-btn">
            تلاش مجدد
          </button>
        )}
      </div>
    </div>
  );
};

export default GeneralErrorFancy;
