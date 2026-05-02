"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
};

export default function NotificationBanner() {
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    loadNotification();
  }, []);

  async function loadNotification() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message")
      .eq("user_id", userData.user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Notification load error:", error.message);
      return;
    }

    if (data && data.length > 0) {
      setNotification(data[0]);
    }
  }

  async function markAsRead() {
    if (!notification) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification.id);

    setNotification(null);
  }

  if (!notification) return null;

  return (
    <div className="mb-6 rounded-2xl border border-[#F28C52]/40 bg-black/50 p-5 shadow-xl">
      <p className="text-xs uppercase tracking-[0.25em] text-[#F28C52]/80">
        Notification
      </p>

      <h2 className="mt-2 text-xl font-bold text-white">
        {notification.title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-white/70">
        {notification.message}
      </p>

      <button
        onClick={markAsRead}
        className="mt-4 rounded-lg bg-[#F28C52] px-4 py-2 text-sm font-semibold text-black hover:bg-[#C96A2C]"
      >
        Got it
      </button>
    </div>
  );
}