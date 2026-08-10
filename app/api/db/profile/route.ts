import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users, poems, likes } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизований" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "poems";

    // Статистика профілю
    const [stats] = await db
      .select({
        poemsCount: sql<number>`
          count(distinct ${poems.id})
        `,
        likesCount: sql<number>`
          count(${likes.id})
        `,
      })
      .from(users)
      .leftJoin(poems, eq(poems.authorId, users.id))
      .leftJoin(likes, eq(likes.poemId, poems.id))
      .where(eq(users.id, userId));

    let profilePoems;

    if (tab === "liked") {
      // Вірші, які користувач лайкнув
      profilePoems = await db
        .select({
          id: poems.id,
          title: poems.title,
          content: poems.content,
          createdAt: poems.createdAt,

          author: {
            id: users.id,
            name: users.name,
          },

          likesCount: sql<number>`
      (
        SELECT COUNT(*)
        FROM ${likes} l
        WHERE l.poem_id = ${poems.id}
      )
    `.as("likes_count"),

          // Ми вже знаємо, що цей користувач його лайкнув
          liked: sql<boolean>`true`.as("liked"),
        })
        .from(likes)
        .innerJoin(poems, eq(likes.poemId, poems.id))
        .leftJoin(users, eq(poems.authorId, users.id))
        .where(eq(likes.userId, userId))
        .orderBy(desc(poems.id));
    } else {
      // Власні вірші
      profilePoems = await db
        .select({
          id: poems.id,
          title: poems.title,
          content: poems.content,
          createdAt: poems.createdAt,

          author: {
            id: users.id,
            name: users.name,
          },

          likesCount: sql<number>`
      (
        SELECT COUNT(*)
        FROM ${likes} l
        WHERE l.poem_id = ${poems.id}
      )
    `.as("likes_count"),

          liked: sql<boolean>`
      EXISTS (
        SELECT 1
        FROM ${likes} l2
        WHERE l2.poem_id = ${poems.id}
          AND l2.user_id = ${userId}
      )
    `.as("liked"),
        })
        .from(poems)
        .leftJoin(users, eq(poems.authorId, users.id))
        .where(eq(poems.authorId, userId))
        .orderBy(desc(poems.id));
    }

    return NextResponse.json({
      stats: {
        poemsCount: Number(stats?.poemsCount ?? 0),
        likesCount: Number(stats?.likesCount ?? 0),
      },
      poems: profilePoems,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Помилка отримання профілю" },
      { status: 500 },
    );
  }
}
