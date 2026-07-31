import LinkAccount from "./LinkAccount";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

export default async function Page({ searchParams }) {
  const { email } = await searchParams;

  const authors = await db.query.users.findMany({
    where: isNull(users.mail),
  });

  return <LinkAccount authors={authors} email={email} />;
}