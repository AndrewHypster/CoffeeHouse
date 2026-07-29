"use client";

import { useEffect, useState } from "react";
import s from "./poems.module.css";

const Poems = () => {
  const [poems, setPoems] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchPoems() {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) {
        params.append("search", search);
      }

      const res = await fetch(`/api/db?${params.toString()}`);
      if (!res.ok) return;

      const data = await res.json();
      setPoems(data);
      console.log(data);
    }

    fetchPoems();
  }, [page, search]);

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  }

  return (
    <div className={s.page}>
      <ul className={s.list}>
        {poems.flatMap((poem, index) => {
          const node = (
            <li className={s.poem} key={poem.id}>
              <h2 className={s.poemTitle}>{poem.title}</h2>
              <p className={s.poemText + " whitespace-pre-wrap"}>
                {poem.content}
              </p>
              <small className={s.poemInfo}>
                {poem.author ? (
                  <p className={s.poemAuthor}>{poem.author.name}</p>
                ) : (
                  <></>
                )}
                <p className={s.poemDate}>{formatDateTime(poem.createdAt)}</p>
              </small>
            </li>
          );

          // Якщо це останній елемент, повертаємо тільки сам елемент
          if (index === poems.length - 1) {
            return [node];
          }

          // Для всіх інших — елемент + роздільник
          return [node, <div className={s.hr} key={"hr-" + poem.id}></div>];
        })}
      </ul>
    </div>
  );
};

export default Poems;
