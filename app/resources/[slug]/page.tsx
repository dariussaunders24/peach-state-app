"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Resource = {
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string | null;
  type: "video" | "blog";
  views: number | null;
};

export default function ResourceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResource();
  }, [slug]);

  async function loadResource() {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error) {
      console.error(error);
      setResource(null);
      setLoading(false);
      return;
    }

    await supabase
  .from("resources")
  .update({
    views: (data.views ?? 0) + 1,
  })
  .eq("id", data.id);

setResource({
  ...data,
  views: (data.views ?? 0) + 1,
});

setLoading(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 text-white">
        <p className="text-neutral-400">Loading resource...</p>
      </main>
    );
  }

  if (!resource) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 text-white">
        <h1 className="text-3xl font-bold">Resource not found</h1>
        <p className="mt-3 text-neutral-400">
          This resource may have been removed or unpublished.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-white">
      <p className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-400">
        {resource.category || "Training"}
      </p>

      <h1 className="text-4xl font-bold">{resource.title}</h1>

      {resource.description && (
        <p className="mt-4 text-lg text-neutral-300">
          {resource.description}
        </p>
      )}
<div className="mt-3 flex items-center gap-1 text-sm text-neutral-400">
  <span>👁</span>
  <span>{resource.views ?? 0} views</span>
</div>
      {resource.video_url && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <iframe
            src={resource.video_url}
            title={resource.title}
            className="aspect-video w-full"
            allowFullScreen
          />
        </div>
      )}

      {resource.thumbnail_url && !resource.video_url && (
        <img
          src={resource.thumbnail_url}
          alt={resource.title}
          className="mt-8 max-h-[500px] w-full rounded-2xl object-cover"
        />
      )}

      {resource.content && (
        <article className="mt-8 whitespace-pre-wrap text-neutral-200">
          {resource.content}
        </article>
      )}
    </main>
  );
}