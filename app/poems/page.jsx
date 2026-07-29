"use client";

import { useEffect, useState, useRef } from "react";
import s from "./poems.module.css";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { useRouter, useSearchParams } from "next/navigation";

const Poems = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [poems, setPoems] = useState(null);
  const [page, setPage] = useState(() =>
    parseInt(searchParams?.get("page") || "1"),
  );
  const [search, setSearch] = useState(() => searchParams?.get("search") || "");
  const cacheRef = useRef(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // keep local state in sync with URL params
  useEffect(() => {
    const urlPage = parseInt(searchParams?.get("page") || "1");
    const urlSearch = searchParams?.get("search") || "";
    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== search) setSearch(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function fetchPoems() {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.set("search", search);

      const key = params.toString();

      // serve from cache when available
      if (cacheRef.current.has(key)) {
        if (!mounted) return;
        setPoems(cacheRef.current.get(key));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/db?${key}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        cacheRef.current.set(key, data);
        setPoems(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchPoems();

    return () => {
      mounted = false;
    };
  }, [page, search]);

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  }

  if (!poems || isLoading) return <Loader />;

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

      <div className={s.pagination}>
        <Button
          className={s.pginationBtn}
          disabled={page <= 1}
          onClick={() => {
            const newPage = Math.max(1, page - 1);
            const params = new URLSearchParams(searchParams?.toString() || "");
            params.set("page", String(newPage));
            if (search) params.set("search", search);
            else params.delete("search");
            router.push(`${window.location.pathname}?${params.toString()}`);
            setPage(newPage);
          }}
        >
          {'<'}
        </Button>
        <span>Сторінка {page}</span>
        <Button
          className={s.pginationBtn}
          disabled={poems.length < 10}
          onClick={() => {
            const newPage = page + 1;
            const params = new URLSearchParams(searchParams?.toString() || "");
            params.set("page", String(newPage));
            if (search) params.set("search", search);
            else params.delete("search");
            router.push(`${window.location.pathname}?${params.toString()}`);
            setPage(newPage);
          }}
        >
          {'>'}
        </Button>
      </div>
    </div>
  );
};

export default Poems;
