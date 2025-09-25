import { useState, useEffect } from "react";
import { getLinkPreview } from "link-preview-js"; // npm install link-preview-js

// ---------- Preview Card ----------
const LinkPreview = ({ url, meta }) => {
  // meta from link-preview-js: { title, description, images: [...] }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl overflow-hidden border border-gray-700 bg-gray-800 hover:bg-gray-700 transition max-w-[320px]"
    >
      {meta?.images?.[0] && (
        <img src={meta.images[0]} alt={meta.title || "preview"} className="w-full h-40 object-cover" />
      )}

      <div className="p-2">
        <p className="text-sm font-semibold text-white truncate">{meta?.title || url}</p>
        {meta?.description && <p className="text-xs text-gray-400 line-clamp-2">{meta.description}</p>}
        <p className="text-xs text-emerald-400 mt-1">{new URL(url).hostname}</p>
      </div>
    </a>
  );
};

export default LinkPreview;
