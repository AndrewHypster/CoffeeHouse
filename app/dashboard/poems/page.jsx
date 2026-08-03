import { db } from "@/lib/db";
import { poems, users } from "@/lib/db/schema";
import { sql, desc, asc, eq } from "drizzle-orm";
import PoemsTableClient from "./PoemsTableClient";
import s from "./poems.module.css";

export default async function Page({ searchParams }) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const [poemsResult, poemCountResult] = await Promise.all([
    db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        createdAt: poems.createdAt,
        author: users.name,
      })
      .from(poems)
      .leftJoin(users, eq(poems.authorId, users.id))
      .orderBy(desc(poems.createdAt), asc(poems.id))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql`count(*)` }).from(poems),
  ]);

  const total = Number(poemCountResult[0]?.count ?? 0);
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={s.page}>
      <PoemsTableClient
        poems={poemsResult}
        pagination={{ pages, currentPage: page, limit }}
      />
    </div>
  );
}
