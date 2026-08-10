import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { likes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизований" },
        { status: 401 }
      );
    }

    const { poemId } = await req.json();

    await db.insert(likes).values({
      userId: Number(session.user.id),
      poemId: Number(poemId),
    });

    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(likes)
      .where(eq(likes.poemId, Number(poemId)));

    return NextResponse.json({
      liked: true,
      count: Number(result[0].count),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Не вдалося поставити лайк" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизований" },
        { status: 401 }
      );
    }

    const { poemId } = await req.json();

    await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, Number(session.user.id)),
          eq(likes.poemId, Number(poemId))
        )
      );

    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(likes)
      .where(eq(likes.poemId, Number(poemId)));

    return NextResponse.json({
      liked: false,
      count: Number(result[0].count),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Не вдалося прибрати лайк" },
      { status: 500 }
    );
  }
}