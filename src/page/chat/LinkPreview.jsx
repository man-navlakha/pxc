import { useState, useEffect } from "react";
import { getLinkPreview } from "link-preview-js"; // npm install link-preview-js

// ---------- Preview Card ----------
const LinkPreview = ({ url, meta }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl overflow-hidden border border-gray-700 bg-gray-800 hover:bg-gray-700 transition max-w-[320px]"
    >
      {meta?.images?.[0] && (
        <img
          src={meta.images[0]}
          alt={meta.title || "Preview"}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-2">
        <p className="text-sm font-semibold text-white truncate">
          {meta?.title || url}
        </p>
        {meta?.description && (
          <p className="text-xs text-gray-400 line-clamp-2">
            {meta.description}
          </p>
        )}
        <p className="text-xs text-emerald-400 mt-1">
          {new URL(url).hostname}
        </p>
      </div>
    </a>
  );
};

// ---------- Renderers ----------
const renderMedia = (raw, linkMeta = {}) => {
  if (!raw) return null;

  const mediaWrapper = "rounded-lg max-w-[280px] md:max-w-[400px] overflow-hidden";

  // Base64 data image
  if (raw.startsWith("data:image")) {
    return <img src={raw} alt="sent" className={`${mediaWrapper} h-auto object-contain`} />;
  }

  // Markdown style ![](url)
  if (raw.startsWith("![")) {
    const url = raw.slice(raw.indexOf("(") + 1, raw.lastIndexOf(")"));
    const yt = isYouTube(url);
    if (yt) {
      return (
        <div className={`${mediaWrapper} aspect-video`}>
          <iframe
            className="w-full h-full rounded-lg"
            src={yt}
            title="YouTube"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    const ext = getExtFromUrl(url);
    if (IMAGE_EXT.includes(ext)) {
      return <img src={url} alt="image" className={`${mediaWrapper} h-auto object-contain`} />;
    }
    if (VIDEO_EXT.includes(ext)) {
      return (
        <video controls className={`${mediaWrapper} max-h-[240px] object-contain`}>
          <source src={url} />
        </video>
      );
    }
    if (AUDIO_EXT.includes(ext)) {
      return (
        <audio controls className={`${mediaWrapper} w-full`}>
          <source src={url} />
        </audio>
      );
    }
    if (DOC_EXT.includes(ext)) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
        >
          📄 Open Document
        </a>
      );
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 break-words break-all">
        {url}
      </a>
    );
  }

  // Plain URL detection
  try {
    const maybeUrl = new URL(raw);
    const yt = isYouTube(raw);
    if (yt) {
      return (
        <div className={`${mediaWrapper} aspect-video`}>
          <iframe
            className="w-full h-full rounded-lg"
            src={yt}
            title="YouTube"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    const ext = getExtFromUrl(raw);
    if (IMAGE_EXT.includes(ext)) {
      return <img src={raw} alt="image" className={`${mediaWrapper} h-auto object-contain`} />;
    }
    if (VIDEO_EXT.includes(ext)) {
      return (
        <video controls className={`${mediaWrapper} max-h-[240px] object-contain`}>
          <source src={raw} />
        </video>
      );
    }
    if (AUDIO_EXT.includes(ext)) {
      return (
        <audio controls className={`${mediaWrapper} w-full`}>
          <source src={raw} />
        </audio>
      );
    }
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

    // If we have metadata → render WhatsApp-style card
    const meta = linkMeta[maybeUrl.href];
    if (meta) {
      return <LinkPreview url={maybeUrl.href} meta={meta} />;
    }

    // Fallback → plain wrapped link
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
};
