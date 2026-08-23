"use client";

import { Send, Share2 } from "lucide-react";

export default function ShareButton({ link }) {
  const handleShare = async () => {
    const url = new URL(link, window.location.origin).href;

    
    try {await navigator.share({
      title: document.title,
      url,
    });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <button onClick={handleShare}>
      <Share2 size={18} />
    </button>
  );
}
