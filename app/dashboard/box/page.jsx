import { db } from "@/lib/db";
import { box } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import BoxTableClient from "./BoxTableClient";
import s from "./box.module.css";

export default async function Page({ searchParams }) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const [boxResult, boxCountResult] = await Promise.all([
    db
      .select({ id: box.id, text: box.text, date: box.date })
      .from(box)
      .orderBy(desc(box.date), desc(box.id))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql`count(*)` }).from(box),
  ]);

  const total = Number(boxCountResult[0]?.count ?? 0);
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={s.page}>
      <BoxTableClient
        boxItems={boxResult}
        pagination={{ pages, currentPage: page, limit }}
      />
    </div>
  );
}
