"use client";

import { useEffect, useState } from "react";
import s from "./profile.module.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import LikeButton from "@/components/like-btn";
import Avatar from "../avatar";
import Post from "../post";

export default function ProfileContent({ userId }) {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [tab, setTab] = useState("poems");
  const [user, setUser] = useState(null);
  const [poems, setPoems] = useState([]);
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
        avatar,
      }),
    });

    if (!res.ok) return;

    setUser((prev) => ({
      ...prev,
      name: trimmedName,
    }));

    setAvatar(avatar);

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

      <section className={s.profile}>
        <CardContent className="flex min-w-0 flex-col items-center gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
          {isEditing && isOwnProfile ? (
            <Input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar([...e.target.value][0] || "")}
              className={s.avatar + " block w-[1em]!"}
            />
          ) : (
            <Avatar
              avatar={user.avatar}
              type={user.avatar_type}
              className={s.avatar}
            />
          )}

          <div className="grid min-w-0 gap-1 text-center sm:text-left">
            {isEditing && isOwnProfile ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs"
              />
            ) : (
              <h1 className="break-words text-2xl font-bold">{user.name}</h1>
            )}

            <div className={s.userStat}>
              <p>
                <b>{stats.poemsCount}</b> Вірші
              </p>
              <p>
                <b>{stats.likesCount}</b> Лайкu
              </p>
            </div>

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
      </section>

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
        <div className="w-fit mx-auto space-y-4">
          {poems.map((poem) => (
            <div key={poem.id} className="">
              <Post
                author={poem.author ?? ""}
                authorId={poem.authorId ?? null}
                avatar={poem.avatar ?? ""}
                avatar_type={poem.avatar_type ?? "smile"}
                content={poem.content}
                date={poem.createdAt}
                id={poem.id}
                liked={poem.liked}
                likes={Number(poem.likesCount)}
                title={poem.title}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
