"use client"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React,{ useEffect } from "react";

export default function authWrapper({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(
    () => {
      if (status === "authenticated") {
        router.push("/");
      }
    },
    [ status, router]
  );

  if (status === "loading") {
    return <div> در حال بارگذاری ...</div>;
  }

  if (status === "unauthenticated") {
    return <>{children}</>;
  }

  return null;
}
