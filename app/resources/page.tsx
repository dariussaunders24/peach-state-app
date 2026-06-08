"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Resource = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  type: "video" | "blog";
  created_at: string;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    const { data, error } = await supabase
      .from("resources")
      .select("id, title, slug, description, thumbnail_url, category, type, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setResources(data || []);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <section className="mb-10">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-orange-400">
          
        </p>
        <h1 className="text-4xl font-bold">Training & Resources</h1>
        <p className="mt-3 max-w-2xl text-neutral-300">
          Learn about off-roading, overlanding, recovery, trail etiquette, gear basics,
          navigation, and more.
        </p>
      </section>

      {resources.length === 0 ? (
        <p className="text-neutral-400">No resources have been published yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={`/resources/${resource.slug}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition hover:border-orange-400/60"
            >
              {resource.thumbnail_url ? (
                <img
                  src={resource.thumbnail_url}
                  alt={resource.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-neutral-800 text-neutral-500">
                  No Image
                </div>
              )}

              <div className="p-5">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <span className="rounded-full bg-orange-500/20 px-2 py-1 text-orange-300">
                    {resource.type}
                  </span>

                  {resource.category && (
                    <span className="rounded-full bg-white/10 px-2 py-1 text-neutral-300">
                      {resource.category}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold">{resource.title}</h2>

                {resource.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-neutral-400">
                    {resource.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}