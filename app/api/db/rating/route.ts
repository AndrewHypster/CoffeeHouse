import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, poems, likes } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "likes";

    if (type === "likes") {
      const rating = await db
        .select({
          id: users.id,
          name: users.name,
          avatar: users.avatar,
          avatar_type: users.avatar_type,
          likes: count(likes.id),
        })
        .from(users)
        .leftJoin(poems, eq(poems.authorId, users.id))
        .leftJoin(likes, eq(likes.poemId, poems.id))
        .groupBy(users.id)
        .orderBy(desc(count(likes.id)));

      return NextResponse.json(rating);
    }

    if (type === "poems") {
      const rating = await db
        .select({
          id: users.id,
          name: users.name,
          avatar: users.avatar,
          avatar_type: users.avatar_type,
          poems: count(poems.id),
        })
        .from(users)
        .leftJoin(poems, eq(poems.authorId, users.id))
        .groupBy(users.id)
        .orderBy(desc(count(poems.id)));

      return NextResponse.json(rating);
    }

    return NextResponse.json(
      { error: "Невідомий тип рейтингу" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Rating error:", error);

    return NextResponse.json(
      { error: "Не вдалося отримати рейтинг" },
      { status: 500 }
    );
  }
}