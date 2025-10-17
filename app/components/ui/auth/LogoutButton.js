"use client";
import { signOut, useSession } from "next-auth/react";
import { Button } from "react-bootstrap";

const LogoutButton = () => {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <Button className="btn-login" onClick={handleLogout}>
      خروج
    </Button>
  );
};

export default LogoutButton;
