"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LikeButton({
  poemId,
  initialLiked = false,
  initialCount = 0,
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/db/likes", {
        method: liked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ poemId }),
      });

      if (!response.ok) {
        throw new Error("Не вдалося змінити лайк");
      }

      const data = await response.json();

      setLiked(data.liked);
      setCount(data.count);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={'18px'}
      onClick={handleLike}
      disabled={loading}
      className="gap-1"
    >
      <Heart
        size={'18px'}
        className={liked ? "fill-current" : ""}
      />

      <span>{count}</span>
    </Button>
  );
}