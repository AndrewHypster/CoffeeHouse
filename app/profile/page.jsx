"use client";

import { useState } from "react";
import s from "./profile.module.css";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useSession } from "next-auth/react";

const Profile = () => {
  const { data: session, update } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");

  const handleEdit = () => {
    if (!session) return;

    setName(session.user.name);
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

  if (!session) return null;

  return (
    <Card className={s.user}>
      <CardContent className="flex justify-between items-center p-0 w-fit">
        <div className="flex gap-5 flex-wrap justify-center">
          <Avatar className={s.userAvatar}>
            <AvatarImage src={session.user.image} />
            <AvatarFallback>
              {session.user.name?.[0]}
            </AvatarFallback>

            <Badge className={s.userBadge}>
              {session.user.role}
            </Badge>
          </Avatar>

          <div className="grid">
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs"
              />
            ) : (
              <h1 className="text-2xl font-bold">
                {session.user.name}
              </h1>
            )}

            <p className="text-muted-foreground">
              {session.user.email}
            </p>

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
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;