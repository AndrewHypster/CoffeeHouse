import Link from "next/link";
import { sql, asc, desc, eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { poems, users, box } from "@/lib/db/schema";
import s from "./dashboard.module.css";

const Dashboard = async () => {
  const [
    userCountResult,
    poemCountResult,
    boxCountResult,
    usersPreview,
    poemsPreview,
    boxPreview,
  ] = await Promise.all([
    db.select({ count: sql`count(*)` }).from(users),
    db.select({ count: sql`count(*)` }).from(poems),
    db.select({ count: sql`count(*)` }).from(box),
    db
      .select({ id: users.id, name: users.name, mail: users.mail })
      .from(users)
      .limit(4)
      .orderBy(asc(users.id)),
    db
      .select({
        id: poems.id,
        title: poems.title,
        author: users.name,
        createdAt: poems.createdAt,
      })
      .from(poems)
      .leftJoin(users, eq(poems.authorId, users.id))
      .orderBy(desc(poems.id))
      .limit(4),
    db
      .select({ id: box.id, text: box.text, date: box.date })
      .from(box)
      .orderBy(desc(box.date), desc(box.id))
      .limit(4),
  ]);

  const userCount = Number(userCountResult[0]?.count ?? 0);
  const poemCount = Number(poemCountResult[0]?.count ?? 0);
  const boxCount = Number(boxCountResult[0]?.count ?? 0);

  return (
    <div className={s.container}>
      <section className={s.hero}>
        <p className={s.subtitle}>Адмін панель</p>
        <h1 className={s.title}>АДМІНКА</h1>
        <p className={s.description}>
          Швидкий огляд кількості користувачів, віршів та повідомлень.
        </p>
      </section>

      <div className={s.metrics}>
        <Card className={s.metricCard}>
          <CardContent>
            <p className={s.metricLabel}>Користувачів</p>
            <p className={s.metricValue}>{userCount}</p>
          </CardContent>
        </Card>

        <Card className={s.metricCard}>
          <CardContent>
            <p className={s.metricLabel}>Віршів</p>
            <p className={s.metricValue}>{poemCount}</p>
          </CardContent>
        </Card>

        <Card className={s.metricCard}>
          <CardContent>
            <p className={s.metricLabel}>Повідомлень</p>
            <p className={s.metricValue}>{boxCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className={s.previews}>
        <Link href="/dashboard/users" className={s.previewLink}>
          <Card className={s.previewCard}>
            <CardHeader className={s.previewHeader}>
              <CardTitle>Користувачі</CardTitle>
              <CardDescription>
                Останні зареєстровані користувачі та короткий перегляд.
              </CardDescription>
            </CardHeader>
            <CardContent className={s.tableWrapper}>
              <table className={s.previewTable}>
                <thead>
                  <tr>
                    <th>Ім'я</th>
                    <th>Електронна пошта</th>
                  </tr>
                </thead>
                <tbody>
                  {usersPreview.map((user) => (
                    <tr key={user.id} className={s.previewRow}>
                      <td>{user.name}</td>
                      <td>{user.mail || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/poems" className={s.previewLink}>
          <Card className={s.previewCard}>
            <CardHeader className={s.previewHeader}>
              <CardTitle>Вірші</CardTitle>
              <CardDescription>
                Коротке прев’ю останніх віршів з автором.
              </CardDescription>
            </CardHeader>
            <CardContent className={s.tableWrapper}>
              <table className={s.previewTable}>
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Автор</th>
                  </tr>
                </thead>
                <tbody>
                  {poemsPreview.map((poem) => (
                    <tr key={poem.id} className={s.previewRow}>
                      <td>{poem.title}</td>
                      <td>{poem.author || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/box" className={s.previewLink}>
          <Card className={s.previewCard}>
            <CardHeader className={s.previewHeader}>
              <CardTitle>Скринька</CardTitle>
              <CardDescription>
                Останні повідомлення з таблиці Скриня.
              </CardDescription>
            </CardHeader>
            <CardContent className={s.tableWrapper}>
              <table className={s.previewTable}>
                <thead>
                  <tr>
                    <th>Повідомлення</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {boxPreview.map((item) => (
                    <tr key={item.id} className={s.previewRow}>
                      <td>
                        <span className={s.boxText}>{item.text}</span>
                      </td>
                      <td>{item.date?.toString?.() || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
