import Lottie from "lottie-react";
import animationData from "@/app/animations/pageLoader.json";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

export default function PageLoader({ children }) {
  const { pageLoader } = usePageLoader();

  return (
    <>
      {pageLoader && (
        <div
          className="d-flex justify-content-center align-items-center bg-white"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            opacity: pageLoader ? 1 : 0, // برای ترانزیشن نرمی
            transition: "opacity 0.2s ease-in-out", // ترانزیشن 200 میلی‌ثانیه
          }}
        >
          <Lottie animationData={animationData} loop={true} style={{ width: 250, height: 250 }} />
        </div>
      )}
      {children}
    </>
  );
}