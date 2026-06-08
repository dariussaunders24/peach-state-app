import { notFound } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Resource = {
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string | null;
  type: "video" | "blog";
};

export default async function ResourceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: resource, error } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (error || !resource) {
    notFound();
  }

  const item = resource as Resource;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-white">
      <p className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-400">
        {item.category || "Training"}
      </p>

      <h1 className="text-4xl font-bold">{item.title}</h1>

      {item.description && (
        <p className="mt-4 text-lg text-neutral-300">{item.description}</p>
      )}

      {item.video_url && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <iframe
            src={item.video_url}
            title={item.title}
            className="aspect-video w-full"
            allowFullScreen
          />
        </div>
      )}

      {item.thumbnail_url && !item.video_url && (
        <img
          src={item.thumbnail_url}
          alt={item.title}
          className="mt-8 max-h-[500px] w-full rounded-2xl object-cover"
        />
      )}

      {item.content && (
        <article className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-neutral-200">
          {item.content}
        </article>
      )}
    </main>
  );
}