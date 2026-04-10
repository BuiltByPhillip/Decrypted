"use client";

import Button from "~/components/Button";

export default function LogoutButton() {

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <Button variant="outline" size="sm" className="rounded-xl font-mono" onClick={handleLogout}>
      Log out
    </Button>
  );
}
