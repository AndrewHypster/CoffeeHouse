"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LinkAccount({ authors, email }) {
  const [userId, setUserId] = useState("");

  const selectedUser = authors.find((user) => String(user.id) === userId);

  async function onSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/db/link-account", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Помилка прив'язки");
      return;
    }

    await signIn("google", {
      callbackUrl: "/",
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>Підв'язка акаунта</CardTitle>
          <CardDescription>
            Це ваш перший вхід. Оберіть себе зі списку авторів, щоб прив'язати
            Google-акаунт.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <input type="hidden" name="mail" value={email} />
            <input type="hidden" name="userId" value={userId} />

            <div className="space-y-2">
              <Label>Автор</Label>

              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  {selectedUser ? selectedUser.name : "Оберіть себе"}
                </SelectTrigger>

                <SelectContent>
                  {authors.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={!userId}>
              Продовжити
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
