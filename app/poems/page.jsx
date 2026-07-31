"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import s from "./poems.module.css";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Ввесь твій попередній код виносимо в окремий внутрішній компонент
const PoemsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [poems, setPoems] = useState(null);
  const [page, setPage] = useState(() =>
    parseInt(searchParams?.get("page") || "1"),
  );
  const [search, setSearch] = useState(() => searchParams?.get("search") || "");
  const [author, setAuthor] = useState(
    () => searchParams?.get("author") ?? false,
  );
  const [authors, setAuthors] = useState(null);
  const cacheRef = useRef(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlPage = parseInt(searchParams?.get("page") || "1");
    const urlSearch = searchParams?.get("search") || "";
    const urlAuthor = searchParams?.get("author") ?? false;

    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== search) setSearch(urlSearch);
    if (urlAuthor !== author) setAuthor(urlAuthor);
  }, [searchParams]);

  useEffect(() => {
    const getAuthors = async () => {
      try {
        const res = await fetch(`/api/db/authors`);
        if (!res.ok) return;
        const data = await res.json();
        setAuthors(data);
      } catch (err) {
        console.error(err);
      }
    };
    getAuthors();
  }, []);

  useEffect(() => {
    const f = async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.set("search", search);
      if (author) {
        params.set("author", author);
      }

      const key = params.toString();

      if (cacheRef.current.has(key)) {
        setPoems(cacheRef.current.get(key));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/db/poems?${key}`);
        if (!res.ok) return;
        const data = await res.json();
        cacheRef.current.set(key, data);
        setPoems(data);
      } catch (err) {
        console.error(err);
      }
    };

    f();
  }, [page, search, author]);

  const updateUrlParams = (newSearch, newAuthor, newPage) => {
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    if (newSearch) params.set("search", newSearch);
    if (newAuthor) {
      params.set("author", newAuthor);
    }
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  }

  if (!poems || (isLoading && !poems)) return <Loader />;

  return (
    <div className={s.page}>
      <div className={s.filter}>
        <b className={s.filterTitle}>Фільтрація</b>
        <div className={s.filterInpts}>
          <input
            className={s.filterInpt}
            type="text"
            placeholder="Назва"
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              setPage(1);
              updateUrlParams(val, author, 1);
            }}
          />
          {authors && (
            <Select
              value={author || "Всі"}
              onValueChange={(value) => {
                setAuthor(value);
                setPage(1);
                updateUrlParams(search, value, 1);
              }}
            >
              <SelectTrigger className="w-full max-w-48">
                <SelectValue placeholder="Виберіть автора" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Автор</SelectLabel>
                  <SelectItem value={false}>Всі</SelectItem>
                  {authors.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <ul className={s.list}>
        {poems.length === 0 ? (
          <p>Нічого не знайдено</p>
        ) : (
          poems.flatMap((poem, index) => {
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

            if (index === poems.length - 1) {
              return [node];
            }

            return [node, <div className={s.hr} key={"hr-" + poem.id}></div>];
          })
        )}
      </ul>

      <div className={s.pagination}>
        <Button
          className={s.pginationBtn}
          disabled={page <= 1}
          onClick={() => {
            const newPage = Math.max(1, page - 1);
            setPage(newPage);
            updateUrlParams(search, author, newPage);
          }}
        >
          {"<"}
        </Button>
        <span>Сторінка {page}</span>
        <Button
          className={s.pginationBtn}
          disabled={poems.length < 10}
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            updateUrlParams(search, author, newPage);
          }}
        >
          {">"}
        </Button>
      </div>
    </div>
  );
};

// 2. Головний експорт сторінки обгортає контент у Suspense із твоїм лоадером
export default function PoemsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <PoemsContent />
    </Suspense>
  );
}
