"use client";

import { useState, useEffect } from "react";
import { UniversalTable } from "@/components/table";
import s from "./poems.module.css";

export default function PoemsTableClient({
  poems: initialPoems,
  pagination: initialPagination,
}) {
  const [poems, setPoems] = useState(initialPoems || []);
  const [usersOptions, setUsersOptions] = useState([]);
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({
    pages: initialPagination?.pages || 1,
    currentPage: initialPagination?.currentPage || 1,
    limit: initialPagination?.limit || 10,
  });

  useEffect(() => {
    setPoems(initialPoems || []);
    // fetch users for author select
    (async () => {
      try {
        const res = await fetch("/api/db/users");
        if (!res.ok) return;
        const data = await res.json();
        const opts = (data || []).map((u) => ({
          value: String(u.id),
          label: u.name,
        }));
        setUsersOptions(opts);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [initialPoems]);

  const fetchPage = async (page) => {
    const res = await fetch(
      `/api/db/poems?page=${page}&limit=${pagination.limit}`,
    );
    if (!res.ok) return;
    const data = await res.json();
    // GET now returns items, total, pages
    if (data?.items) {
      setPoems(data.items);
      setPagination((p) => ({
        ...p,
        pages: data.pages ?? p.pages,
        currentPage: page,
      }));
    }
  };

  const handleChange = async ({ id, key, value }) => {
    if (value === undefined || value === null) return;

    setStatus("saving");

    // coerce authorId to number if needed
    if (key === "authorId" && typeof value === "string") {
      const n = Number(value);
      if (!Number.isNaN(n)) value = n;
    }

    const response = await fetch("/api/db/poems", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [key]: value }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    const data = await response.json();

    if (data?.poem) {
      setPoems((prev) =>
        prev.map((p) => (p.id === data.poem.id ? data.poem : p)),
      );
      setStatus("saved");
      window.setTimeout(() => setStatus(""), 1500);
      return;
    }

    setStatus("error");
  };

  const columns = [
    {
      header: "ID",
      key: "id",
      className: "max-w-[20px] text-slate-300",
      type: "text",
    },
    {
      header: "Назва",
      key: "title",
      className: "w-[50px] text-slate-300",
      type: "text",
      editable: true,
    },
    {
      header: "Текст",
      key: "content",
      type: "textarea",
      editable: true,
      className: "max-w-[200px] truncate",
    },
    {
      header: "Автор",
      key: "authorId",
      className: "max-w-[45px] text-slate-300",
      type: "text",
      editable: true,
      options: usersOptions,
      render: (item) => <span>{item.author || "—"}</span>,
    },
    { header: "Дата", key: "createdAt", type: "text" },
  ];

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <div>
          <p className={s.section}>Адмінка</p>
          <h1 className={s.title}>Вірші</h1>
          <p className={s.description}>
            Перегляд та редагування віршів. Клік по клітинці відкриває
            редагування.
          </p>
        </div>
        <div className={s.status}>
          {status === "saving"
            ? "Зберігається..."
            : status === "saved"
              ? "Збережено"
              : status === "error"
                ? "Помилка збереження"
                : ""}
        </div>
      </div>

      <div className={s.tableWrapper}>
        <UniversalTable
          data={poems}
          columns={columns}
          onChange={handleChange}
          onDelete={async (ids) => {
            const res = await fetch("/api/db/poems", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids }),
            });
            if (!res.ok) return;
            await fetchPage(pagination.currentPage);
          }}
          pagination={{
            pages: pagination.pages,
            currentPage: pagination.currentPage,
            isNextDisabled: pagination.currentPage >= pagination.pages,
            onPageChange: (p) => fetchPage(p),
          }}
        />
      </div>
    </div>
  );
}
