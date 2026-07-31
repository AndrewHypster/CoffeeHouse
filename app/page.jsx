import { Button } from "@/components/ui/button";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Головна секція */}
      <main className={styles.main}>
        <h1 className={styles.title}>Вітаємо у CoffeeHouse</h1>
        <p className={styles.description}>
          Спільнота друзів, об’єднана любов’ю до справжньої кави та затишних
          розмов.
        </p>
        <div className="flex gap-2 text-xl mt-4 flex-wrap">
          <Link href="/poems">
            <Button>Вірші</Button>
          </Link>
          <Link href="/write-poem">
            <Button>Написати вірш</Button>
          </Link>
          <Link href="/profile">
            <Button>кабінет</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
