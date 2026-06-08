"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Resource = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  type: "video" | "blog";
  published: boolean;
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"video" | "blog">("blog");

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setResources(data);
    }
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setContent("");
    setVideoUrl("");
    setThumbnailUrl("");
    setCategory("");
    setType("blog");
  }

  async function saveResource() {
    if (!title || !slug) {
      alert("Title and slug are required.");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("resources")
        .update({
          title,
          slug,
          description,
          content,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          category,
          type,
        })
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Error updating resource");
        return;
      }
    } else {
      const { error } = await supabase.from("resources").insert({
        title,
        slug,
        description,
        content,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        category,
        type,
        published: true,
      });

      if (error) {
        console.error(error);
        alert("Error creating resource");
        return;
      }
    }

    resetForm();
    loadResources();
  }

  async function deleteResource(id: string) {
    const confirmed = confirm("Delete this resource?");

    if (!confirmed) return;

    const { error } = await supabase.from("resources").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Error deleting resource");
      return;
    }

    loadResources();
  }

  async function uploadThumbnail(file: File) {
    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("resource-images")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      alert("Upload failed");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("resource-images")
      .getPublicUrl(fileName);

    setThumbnailUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <h1 className="mb-8 text-4xl font-bold">Manage Training Resources</h1>

      <div className="mb-10 rounded-2xl border border-white/10 bg-neutral-900 p-6">
        <div className="grid gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-lg bg-neutral-800 p-3"
          />

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug-example"
            className="rounded-lg bg-neutral-800 p-3"
          />

          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="rounded-lg bg-neutral-800 p-3"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as "video" | "blog")}
            className="rounded-lg bg-neutral-800 p-3"
          >
            <option value="blog">Blog</option>
            <option value="video">Video</option>
          </select>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Thumbnail Image</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                uploadThumbnail(file);
              }}
              className="rounded-lg bg-neutral-800 p-3"
            />

            {uploading && (
              <p className="text-sm text-orange-300">Uploading image...</p>
            )}

            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt="Preview"
                className="h-40 w-full rounded-xl object-cover"
              />
            )}
          </div>

         <input
  value={videoUrl}
  onChange={(e) => {
    let url = e.target.value.trim();

    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];

      if (videoId) {
        url = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];

      if (videoId) {
        url = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    setVideoUrl(url);
  }}
  placeholder="YouTube URL"
  className="rounded-lg bg-neutral-800 p-3"
/>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={3}
            className="rounded-lg bg-neutral-800 p-3"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Full article content"
            rows={10}
            className="rounded-lg bg-neutral-800 p-3"
          />

          <div className="flex gap-3">
            <button
              onClick={saveResource}
              className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-400"
            >
              {editingId ? "Update Resource" : "Publish Resource"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-lg border border-white/20 px-5 py-3 font-semibold text-white/80 transition hover:border-white/40"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-neutral-900 p-4"
          >
            <div>
              <h2 className="text-lg font-semibold">{resource.title}</h2>

              <p className="text-sm text-neutral-400">
                {resource.type} • {resource.category || "No category"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(resource.id);
                  setTitle(resource.title || "");
                  setSlug(resource.slug || "");
                  setDescription(resource.description || "");
                  setContent(resource.content || "");
                  setVideoUrl(resource.video_url || "");
                  setThumbnailUrl(resource.thumbnail_url || "");
                  setCategory(resource.category || "");
                  setType(resource.type || "blog");

                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-lg border border-blue-500/30 px-3 py-2 text-blue-300"
              >
                Edit
              </button>

              <button
                onClick={() => deleteResource(resource.id)}
                className="rounded-lg border border-red-500/30 px-3 py-2 text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}