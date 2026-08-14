import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { db } from "@/lib/db";
import { users, poems, likes } from "@/lib/db/schema";

import { eq, sql, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизований" }, { status: 401 });
    }

    const currentUserId = Number(session.user.id);

    const { searchParams } = new URL(req.url);

    const requestedUserIdParam = searchParams.get("userId");
    const tab = searchParams.get("tab") || "poems";

    const requestedUserId = requestedUserIdParam
      ? Number(requestedUserIdParam)
      : currentUserId;

    if (!Number.isInteger(requestedUserId) || requestedUserId <= -2) {
      return NextResponse.json(
        { error: "Некоректний ID користувача" },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // USER
    // --------------------------------------------------

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
            avatar: users.avatar,
            avatar_type: users.avatar_type,
        mail: users.mail,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, requestedUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Користувача не знайдено" },
        { status: 404 },
      );
    }

    // --------------------------------------------------
    // STATS
    // --------------------------------------------------

    const [stats] = await db
      .select({
        poemsCount: sql<number>`
          COUNT(DISTINCT ${poems.id})
        `,

        likesCount: sql<number>`
          COUNT(${likes.id})
        `,
      })
      .from(users)
      .leftJoin(poems, eq(poems.authorId, users.id))
      .leftJoin(likes, eq(likes.poemId, poems.id))
      .where(eq(users.id, requestedUserId));

    // --------------------------------------------------
    // POEMS
    // --------------------------------------------------

    let profilePoems;

    if (tab === "liked") {
      profilePoems = await db
        .select({
          id: poems.id,
          title: poems.title,
          content: poems.content,
          createdAt: poems.createdAt,

          author: {
            id: users.id,
            name: users.name,
            avatar: users.avatar,
            avatar_type: users.avatar_type,
          },

          likesCount: sql<number>`
        (
          SELECT COUNT(*)
          FROM ${likes} l
          WHERE l.poem_id = ${poems.id}
        )
      `,

          // Чи лайкнув ЦЕЙ ВІРШ поточний користувач
          liked: sql<boolean>`
        EXISTS (
          SELECT 1
          FROM ${likes} l2
          WHERE l2.poem_id = ${poems.id}
            AND l2.user_id = ${currentUserId}
        )
      `,
        })
        .from(likes)
        .innerJoin(poems, eq(likes.poemId, poems.id))
        .leftJoin(users, eq(poems.authorId, users.id))
        .where(eq(likes.userId, user.id))
        .orderBy(desc(poems.id));
    } else {
      // Власні вірші користувача
      profilePoems = await db
        .select({
          id: poems.id,
          title: poems.title,
          content: poems.content,
          createdAt: poems.createdAt,

          author: {
            id: users.id,
            name: users.name,
            avatar: users.avatar,
            avatar_type: users.avatar_type,
          },

          likesCount: sql<number>`
            (
              SELECT COUNT(*)
              FROM ${likes} l
              WHERE l.poem_id = ${poems.id}
            )
          `,

          liked: sql<boolean>`
            EXISTS (
              SELECT 1
              FROM ${likes} l2
              WHERE l2.poem_id = ${poems.id}
                AND l2.user_id = ${currentUserId}
            )
          `,
        })
        .from(poems)
        .leftJoin(users, eq(poems.authorId, users.id))
        .where(eq(poems.authorId, requestedUserId))
        .orderBy(desc(poems.id));
    }

    return NextResponse.json({
      user,
      isOwnProfile: currentUserId === requestedUserId,

      stats: {
        poemsCount: Number(stats?.poemsCount ?? 0),

        likesCount: Number(stats?.likesCount ?? 0),
      },

      poems: profilePoems,
    });
  } catch (error) {
    console.error("PROFILE API ERROR:", error);

    return NextResponse.json(
      { error: "Помилка отримання профілю" },
      { status: 500 },
    );
  }
}
