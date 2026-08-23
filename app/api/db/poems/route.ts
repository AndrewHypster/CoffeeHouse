import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { poems, users, likes } from "@/lib/db/schema";
import { desc, asc, eq, ilike, and, sql, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Читання всіх віршів (сортування за датою та автором)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : null;

  try {
    const { searchParams } = new URL(request.url);

    const postId = Math.max(1, parseInt(searchParams.get("post-id")));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const offset = (page - 1) * limit;

    const authorQuery = searchParams.get("author"); // може бути ім'ям або ID
    const search = searchParams.get("search");

    const conditions = [];

    // Фільтрація за назвою вірша
    if (search) {
      conditions.push(ilike(poems.title, `%${search}%`));
    }

    // Фільтрація за автором (якщо передано текст або ID)
    if (authorQuery) {
      const authorId = Number(authorQuery);
      if (!Number.isNaN(authorId)) {
        conditions.push(eq(poems.authorId, authorId));
      } else {
        conditions.push(ilike(users.name, `%${authorQuery}%`));
      }
    }

    // =========================================================
    // ОДИН ПОСТ
    // =========================================================

    if (postId !== null && !Number.isNaN(postId)) {
      if (session) {
        const result = await db
          .select({
            id: poems.id,
            title: poems.title,
            content: poems.content,
            createdAt: poems.createdAt,
            authorId: poems.authorId,
            author: users.name,
            avatar: users.avatar,
            avatar_type: users.avatar_type,

            likesCount: sql<number>`
              (
                SELECT COUNT(*)
                FROM ${likes}
                WHERE ${likes.poemId} = ${poems.id}
              )
            `.as("likes_count"),

            liked: userId
              ? sql<boolean>`
                  EXISTS (
                    SELECT 1
                    FROM ${likes}
                    WHERE ${likes.poemId} = ${poems.id}
                    AND ${likes.userId} = ${userId}
                  )
                `.as("liked")
              : sql<boolean>`false`.as("liked"),
          })
          .from(poems)
          .leftJoin(users, eq(poems.authorId, users.id))
          .where(eq(poems.id, postId));

        return NextResponse.json(
          {
            post: result[0] ?? null,
          },
          { status: 200 },
        );
      } else {
        const result = await db
          .select({
            id: poems.id,
            title: poems.title,
            content: poems.content,
            createdAt: poems.createdAt,
          })
          .from(poems)
          .where(eq(poems.id, postId));

        return NextResponse.json(
          {
            post: result[0] ?? null,
          },
          { status: 200 },
        );
      }
    }

    // =========================================================
    // СПИСОК ПОСТІВ
    // =========================================================

    let result
    if (session) {
      result = await db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        createdAt: poems.createdAt,
        authorId: poems.authorId,
        author: users.name,
        avatar: users.avatar,
        avatar_type: users.avatar_type,
        
        likesCount: sql<number>`
      (
        SELECT COUNT(*)
        FROM ${likes}
        WHERE ${likes.poemId} = ${poems.id}
      )
    `.as("likes_count"),

        liked: userId
          ? sql<boolean>`
          EXISTS (
            SELECT 1
            FROM ${likes}
            WHERE ${likes.poemId} = ${poems.id}
            AND ${likes.userId} = ${userId}
          )
        `.as("liked")
          : sql<boolean>`false`.as("liked"),
      })
      .from(poems)
      .leftJoin(users, eq(poems.authorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(poems.createdAt), asc(poems.authorId))
      .limit(limit)
      .offset(offset);
    } else {
     result = await db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        createdAt: poems.createdAt,
      })
      .from(poems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(poems.createdAt), asc(poems.authorId))
      .limit(limit)
      .offset(offset);
    }
    

    // total count for pagination
    const countRes = await db.select({ count: sql`count(*)` }).from(poems);
    const total = Number(countRes[0]?.count ?? 0);
    const pages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ items: result, total, pages }, { status: 200 });
  } catch (error) {
    console.error("DB GET ERROR", error);
    return NextResponse.json(
      { error: "Помилка при читанні віршів" },
      { status: 500 },
    );
  }
}

// POST: Запис нового вірша
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author_id = "0", title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Заповни всі обов’язкові поля!" },
        { status: 400 },
      );
    }

    const authorId = Number(author_id);
    if (Number.isNaN(authorId)) {
      return NextResponse.json(
        { error: "Невірний author_id" },
        { status: 400 },
      );
    }

    const newPoem = await db
      .insert(poems)
      .values({
        authorId,
        title,
        content,
      })
      .returning(); // .returning() повертає створений рядок (працює в Postgres)

    return NextResponse.json(
      { success: true, poem: newPoem[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("DB POST ERROR", error);
    return NextResponse.json(
      { error: "Помилка при збереженні вірша" },
      { status: 500 },
    );
  }
}

// PATCH: Оновлення вірша (title, content)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, content } = body;
    const authorId = body.authorId;

    if (typeof id !== "number") {
      return NextResponse.json(
        { error: "Невірний ідентифікатор вірша" },
        { status: 400 },
      );
    }

    const data: Partial<typeof poems.$inferInsert> = {};
    if (typeof title === "string") data.title = title.trim();
    if (typeof content === "string") data.content = content.trim();
    if (typeof authorId === "number") data.authorId = authorId;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Немає даних для оновлення" },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(poems)
      .set(data)
      .where(eq(poems.id, id))
      .returning();

    // attach author name
    const row = await db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        createdAt: poems.createdAt,
        author: users.name,
      })
      .from(poems)
      .leftJoin(users, eq(poems.authorId, users.id))
      .where(eq(poems.id, id));

    return NextResponse.json({ success: true, poem: row[0] });
  } catch (error) {
    console.error("DB PATCH ERROR", error);
    return NextResponse.json(
      { error: "Помилка при оновленні вірша" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : [body?.id];
    const validIds = ids.filter((id) => typeof id === "number");

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "Потрібно вказати ідентифікатори для видалення" },
        { status: 400 },
      );
    }

    await db.delete(poems).where(inArray(poems.id, validIds));

    return NextResponse.json({ success: true, deleted: validIds.length });
  } catch (error) {
    console.error("POEMS DELETE ERROR", error);
    return NextResponse.json(
      { error: "Помилка при видаленні віршів" },
      { status: 500 },
    );
  }
}
