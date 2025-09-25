import React from "react";

// Supported extensions
const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "avif"];
const VIDEO_EXT = ["mp4", "webm", "ogg", "mov", "m4v"];
const AUDIO_EXT = ["mp3", "wav", "ogg", "m4a", "aac", "flac"];
const DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "md"];

// Extract file extension from URL
export const getExtFromUrl = (raw) => {
  try {
    const u = new URL(raw);
    const p = u.pathname.split("?")[0].split("#")[0];
    const dot = p.lastIndexOf(".");
    return dot > -1 ? p.slice(dot + 1).toLowerCase() : "";
  } catch {
    const q = raw.split("?")[0].split("#")[0];
    const dot = q.lastIndexOf(".");
    return dot > -1 ? q.slice(dot + 1).toLowerCase() : "";
  }
};

// Component wrapper for rendering media
export default function MediaRenderer({ raw, linkMeta = {}, openLightbox }) {
  if (!raw) return null;

  const bubbleMediaWrapper =
    "w-40 h-40 md:w-56 md:h-56 rounded-lg overflow-hidden cursor-pointer";

  try {
    const maybeUrl = new URL(raw);
    const ext = getExtFromUrl(raw);

    // 📷 Image
    if (IMAGE_EXT.includes(ext)) {
      return (
        <img
          src={raw}
          alt="image"
          onClick={() => openLightbox?.({ url: raw, type: "image" })}
          className={`${bubbleMediaWrapper} object-cover hover:opacity-90`}
        />
      );
    }

    // 🎥 Video
    if (VIDEO_EXT.includes(ext)) {
      return (
        <video
          controls
          onClick={() => openLightbox?.({ url: raw, type: "video" })}
          className={`${bubbleMediaWrapper} object-cover hover:opacity-90`}
        >
          <source src={raw} />
        </video>
      );
    }

    // 🎵 Audio
    if (AUDIO_EXT.includes(ext)) {
      return (
        <audio controls className="w-56">
          <source src={raw} />
        </audio>
      );
    }

    // 📄 Document
    if (DOC_EXT.includes(ext)) {
      return (
        <a
          href={raw}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
        >
          📄 Open Document
        </a>
      );
    }

    // 🔗 Links (rich preview or fallback)
    const meta = linkMeta[maybeUrl.href];
    if (meta) {
      return <LinkPreview url={maybeUrl.href} meta={meta} />;
    }

    return (
      <a
        href={raw}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-400 break-words break-all"
      >
        {maybeUrl.href}
      </a>
    );
  } catch {
    return <p>{raw}</p>;
  }
}
