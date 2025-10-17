"use client";

import "./styles/globals.css";
import "./styles/cart.css";
import "./styles/responsive.css";
import "bootstrap/dist/css/bootstrap.rtl.min.css";

import SessionProviderWrapper from "./components/ui/auth/SessionProviderWrapper";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { SidebarProvider } from "@/app/context/SidebarContext";
import { usePathname } from "next/navigation";
import { CartProvider } from "./context/CartContext";
import ScrollToTop from "./components/ui/ScrollToTop";
import { NotificationProvider } from "@/app/context/NotificationContext";
import PageLoader from "./components/ui/PageLoader";
import { PageLoaderProvider } from "./context/PageLoaderProvider";
import GlobalToast from "./components/ui/GlobalToast";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();

  const hideHeaderFooter =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/user") ||
    pathname.startsWith("/cart/success") ||
    pathname.startsWith("/cart/fail");

  return (
    <html lang="fa" dir="rtl">
      <body className="d-flex flex-column min-vh-100 m-0 p-0">
        <SessionProviderWrapper>
          <CartProvider>
            <SidebarProvider>
              <NotificationProvider>
                <ScrollToTop />
                <PageLoaderProvider>
                  {!hideHeaderFooter && <PageLoader />}
                  {!hideHeaderFooter && <Header />}
                  {!hideHeaderFooter && (
                    <div className="main-pt">
                      <main className="flex-grow-1 d-flex flex-column p-0 m-0 bg-light-purple">
                        {children}
                      </main>
                    </div>
                  )}
                  {hideHeaderFooter && (
                    <main className="flex-grow-1 d-flex flex-column p-0 m-0 bg-light-purple">
                      {children}
                    </main>
                  )}
                  {!hideHeaderFooter && <Footer />}
                  <GlobalToast />
                </PageLoaderProvider>
              </NotificationProvider>
            </SidebarProvider>
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}