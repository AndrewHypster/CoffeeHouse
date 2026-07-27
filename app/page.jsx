import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Головна секція */}
      <main className={styles.main}>
        <h1 className={styles.title}>
          Вітаємо у CoffeeHouse
        </h1>
        <p className={styles.description}>
          Спільнота друзів, об'єднана любов'ю до справжньої кави та затишних розмов.
        </p>
      </main>
    </div>
  )
}