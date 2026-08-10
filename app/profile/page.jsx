"use client";

import { useEffect, useState } from "react";
import s from "./profile.module.css";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Heart, FileText } from "lucide-react";

import { useSession } from "next-auth/react";

import LikeButton from "@/components/like-btn";

const Profile = () => {
  const { data: session, update } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");

  const [tab, setTab] = useState("poems");
  const [poems, setPoems] = useState([]);
  const [stats, setStats] = useState({
    poemsCount: 0,
    likesCount: 0,
  });

  const [loading, setLoading] = useState(true);

  const handleEdit = () => {
    if (!session) return;

    setName(session.user.name || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    const res = await fetch("/api/db/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) return;

    await update();

    setIsEditing(false);
  };

  useEffect(() => {
    if (!session) return;

    const getProfile = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/db/profile?tab=${tab}`);

        if (!res.ok) return;

        const data = await res.json();

        setStats(data.stats);
        setPoems(data.poems);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session, tab]);

  if (!session) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* PROFILE */}
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={session.user.image || ""} />

            <AvatarFallback className="text-3xl">
              {session.user.name?.[0]?.toUpperCase()}
            </AvatarFallback>

            <Badge className={s.userBadge}>{session.user.role}</Badge>
          </Avatar>

          <div className="grid gap-2">
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs"
              />
            ) : (
              <h1 className="text-2xl font-bold">{session.user.name}</h1>
            )}

            <p className="text-muted-foreground">{session.user.email}</p>

            {isEditing ? (
              <Button onClick={handleSave} className={s.userBtn}>
                Зберегти
              </Button>
            ) : (
              <Button onClick={handleEdit} className={s.userBtn}>
                Редагувати
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center justify-center gap-3 p-5">
            <FileText size={22} />

            <div>
              <p className="text-2xl font-bold">{stats.poemsCount}</p>

              <p className="text-sm text-muted-foreground">Віршів</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-center gap-3 p-5">
            <Heart size={22} />

            <div>
              <p className="text-2xl font-bold">{stats.likesCount}</p>

              <p className="text-sm text-muted-foreground">Лайків</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-2 border-b">
        <button
          type="button"
          onClick={() => setTab("poems")}
          className={`py-3 text-sm font-medium transition ${
            tab === "poems"
              ? "border-b-2 border-foreground"
              : "text-muted-foreground"
          }`}
        >
          Мої вірші
        </button>

        <button
          type="button"
          onClick={() => setTab("liked")}
          className={`py-3 text-sm font-medium transition ${
            tab === "liked"
              ? "border-b-2 border-foreground"
              : "text-muted-foreground"
          }`}
        >
          Вподобані
        </button>
      </div>

      {/* POEMS */}
      {loading ? (
        <p className="py-10 text-center text-muted-foreground">
          Завантаження...
        </p>
      ) : poems.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          {tab === "poems"
            ? "У тебе ще немає віршів"
            : "Ти ще не вподобав жодного вірша"}
        </p>
      ) : (
        <div className="space-y-4">
          {poems.map((poem) => (
            <Card key={poem.id}>
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold">{poem.title}</h2>

                <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                  {poem.content}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {poem.author?.name}
                  </p>

                  <LikeButton
  poemId={poem.id}
  initialLiked={poem.liked}
  initialCount={Number(poem.likesCount)}
  onLikeChange={(liked) => {
    if (tab === "liked" && !liked) {
      setPoems((prev) => prev.filter((item) => item.id !== poem.id));
    }
  }}
/>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
