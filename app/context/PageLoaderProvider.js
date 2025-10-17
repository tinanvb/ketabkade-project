import { createContext, useContext, useState } from "react";

const PageLoaderContext = createContext();

export function PageLoaderProvider({ children }) {
  const [loaderCount, setLoaderCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // لودینگ اولیه فعال

  const startLoading = () => setLoaderCount((c) => {
    return c + 1;
  });

  const stopLoading = () => setLoaderCount((c) => {
    const newCount = Math.max(c - 1, 0);
    if (newCount === 0) {
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 200); // تأخیر 200 میلی‌ثانیه برای نرمی
    }
    return newCount;
  });

  return (
    <PageLoaderContext.Provider
      value={{ pageLoader: isInitialLoading || loaderCount > 0, startLoading, stopLoading }}
    >
      {children}
    </PageLoaderContext.Provider>
  );
}

export const usePageLoader = () => useContext(PageLoaderContext);