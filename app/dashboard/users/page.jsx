import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import UsersTableClient from "./UsersTableClient";
import s from "./users.module.css";

export default async function Page() {
  const allUsers = await db.query.users.findMany({
    orderBy: users.id,
  });

  return (
    <div className={s.page}>
      <UsersTableClient users={allUsers} />
    </div>
  );
}
