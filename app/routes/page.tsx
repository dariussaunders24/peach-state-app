"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const adminEmails = ["dariussaunders24@gmail.com"];

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [newRoute, setNewRoute] = useState({
    title: "",
    location: "",
    onx_url: "",
    difficulty: "",
    notes: "",
  });

  useEffect(() => {
    checkUser();
    loadRoutes();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (data.user && adminEmails.includes((data.user.email || "").toLowerCase())) {
      setIsAdmin(true);
    }
  }

  async function loadRoutes() {
    const { data, error } = await supabase
      .from("route_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setRoutes(data || []);
  }

  async function createRoute() {
    const title = newRoute.title.trim();
    const onxUrl = newRoute.onx_url.trim();

    if (!title) {
      alert("Route title required");
      return;
    }

    if (!onxUrl) {
      alert("OnX link required");
      return;
    }

    const { error } = await supabase.from("route_links").insert({
      title,
      location: newRoute.location.trim(),
      onx_url: onxUrl,
      difficulty: newRoute.difficulty.trim(),
      notes: newRoute.notes.trim(),
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNewRoute({
      title: "",
      location: "",
      onx_url: "",
      difficulty: "",
      notes: "",
    });

    await loadRoutes();
  }

  async function deleteRoute(routeId: string) {
    if (!confirm("Delete this route link?")) return;

    const { error } = await supabase
      .from("route_links")
      .delete()
      .eq("id", routeId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadRoutes();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F28C52]">Route Library</h1>
        <p className="mt-2 text-gray-300">
          Saved OnX routes, trail notes, and previous ride links.
        </p>
      </div>

      {isAdmin && (
        <div className="space-y-3 rounded-xl border border-[#F28C52]/30 bg-black/40 p-4">
          <h2 className="text-xl font-bold text-white">Add OnX Route</h2>

          <input
            type="text"
            placeholder="Route Title"
            value={newRoute.title}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="text"
            placeholder="Location"
            value={newRoute.location}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, location: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="url"
            placeholder="OnX Route Link"
            value={newRoute.onx_url}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, onx_url: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <input
            type="text"
            placeholder="Difficulty"
            value={newRoute.difficulty}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, difficulty: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <textarea
            placeholder="Notes"
            value={newRoute.notes}
            onChange={(e) =>
              setNewRoute((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="min-h-28 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-black placeholder-gray-500"
          />

          <button
            onClick={createRoute}
            className="rounded bg-[#F28C52] px-4 py-2 font-semibold text-black hover:bg-[#C96A2C]"
          >
            Add Route
          </button>
        </div>
      )}

      {routes.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-5">
          <p className="text-gray-400">No routes saved yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {routes.map((route) => (
            <div
              key={route.id}
              className="rounded-xl border border-[#F28C52]/20 bg-black/40 p-5"
            >
              <h2 className="text-xl font-bold text-white">{route.title}</h2>

              {route.location && (
                <p className="mt-1 text-gray-300">{route.location}</p>
              )}

              {route.difficulty && (
                <p className="mt-2 text-sm font-semibold text-[#F28C52]">
                  Difficulty: {route.difficulty}
                </p>
              )}

              {route.notes && (
                <p className="mt-3 whitespace-pre-wrap text-gray-300">
                  {route.notes}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3">
                <a
                  href={route.onx_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[#F28C52] px-4 py-2 text-center font-semibold text-[#F28C52] hover:bg-[#F28C52] hover:text-black"
                >
                  Open OnX Route
                </a>

                {isAdmin && (
                  <button
                    onClick={() => deleteRoute(route.id)}
                    className="rounded bg-red-500 px-3 py-2 font-semibold text-white hover:bg-red-600"
                  >
                    Delete Route
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}