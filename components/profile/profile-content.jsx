"use client";

import { useEffect, useState } from "react";
import s from "@/app/profile/profile.module.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import LikeButton from "@/components/like-btn";

export default function ProfileContent({ userId }) {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [tab, setTab] = useState("poems");
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([])
  const [stats, setStats] = useState({
    poemsCount: 0,
    likesCount: 0,
  });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // LOAD PROFILE
  // --------------------------------------------------

  useEffect(() => {
    if (!session) return;

    const getProfile = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        if (userId >= -2) {
          params.set("userId", String(userId));
        }
        params.set("tab", tab);
        const res = await fetch(`/api/db/profile?${params.toString()}`);
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();

        setUser(data.user);
        setStats(data.stats);
        setPoems(data.poems);
        setIsOwnProfile(data.isOwnProfile);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session, userId, tab]);

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  const handleEdit = () => {
    if (!user) return;
    setName(user.name || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) return;
    const res = await fetch("/api/db/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: trimmedName,
      }),
    });

    if (!res.ok) return;

    setUser((prev) => ({
      ...prev,
      name: trimmedName,
    }));

    await update();

    setIsEditing(false);
  };

  // --------------------------------------------------
  // SESSION
  // --------------------------------------------------

  if (!session) {
    return null;
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading && !user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-3 py-6">
        <p className="text-center text-muted-foreground">Завантаження...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-3 py-6">
        <p className="text-center text-muted-foreground">
          Користувача не знайдено
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 space-y-6 px-3 py-6 sm:px-4">
      {/* PROFILE */}

      <Card className="w-full min-w-0 overflow-hidden">
        <CardContent className="flex min-w-0 flex-col items-center gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
          <Avatar className="h-24 w-24 shrink-0">
            <AvatarImage src="" />

            <AvatarFallback className="text-3xl">
              {user.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>

            <Badge className={s.userBadge}>{user.role}</Badge>
          </Avatar>

          <div className="grid min-w-0 gap-2 text-center sm:text-left">
            {isEditing && isOwnProfile ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs"
              />
            ) : (
              <h1 className="break-words text-2xl font-bold">{user.name}</h1>
            )}

            <p className="max-w-full break-all text-muted-foreground">
              {user.mail}
            </p>

            {isOwnProfile && (
              <>
                {isEditing ? (
                  <Button onClick={handleSave} className={s.userBtn}>
                    Зберегти
                  </Button>
                ) : (
                  <Button onClick={handleEdit} className={s.userBtn}>
                    Редагувати
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* STATS */}

      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="flex items-center justify-center gap-2 p-4 sm:gap-3 sm:p-5">
            <FileText size={22} />

            <div>
              <p className="text-2xl font-bold">{stats.poemsCount}</p>

              <p className="text-sm text-muted-foreground">Віршів</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-center gap-2 p-4 sm:gap-3 sm:p-5">
            <Heart size={22} />

            <div>
              <p className="text-2xl font-bold">{stats.likesCount}</p>

              <p className="text-sm text-muted-foreground">Лайків</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}

      <div className="grid w-full grid-cols-2 border-b">
        <button
          type="button"
          onClick={() => setTab("poems")}
          className={`min-w-0 py-3 text-sm font-medium transition ${
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
          className={`min-w-0 py-3 text-sm font-medium transition ${
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
            ? isOwnProfile
              ? "У тебе ще немає віршів"
              : "Користувач ще не написав віршів"
            : "Немає вподобаних віршів"}
        </p>
      ) : (
        <div className="w-full min-w-0 space-y-4">
          {poems.map((poem) => (
            <Card key={poem.id} className="w-full min-w-0 overflow-hidden">
              <CardContent className="min-w-0 p-4 sm:p-5">
                <h2 className="break-words text-xl font-semibold">
                  {poem.title}
                </h2>

                <p className="mt-3 whitespace-pre-wrap break-words text-muted-foreground">
                  {poem.content}
                </p>

                <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm text-muted-foreground">
                    {poem.author?.name}
                  </p>

                  <LikeButton
                    poemId={poem.id}
                    initialLiked={poem.liked}
                    initialCount={Number(poem.likesCount)}
                    onLikeChange={(liked) => {
                      if (tab === "liked" && !liked) {
                        setPoems((prev) =>
                          prev.filter((item) => item.id !== poem.id),
                        );
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
}
