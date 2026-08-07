"use client";

import { useState } from "react";
import { UniversalTable } from "@/components/table";
import s from "./box.module.css";

export default function BoxTableClient({
  boxItems: initialBoxItems,
  pagination: initialPagination,
}) {
  const [items, setItems] = useState(initialBoxItems || []);
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({
    pages: initialPagination?.pages || 1,
    currentPage: initialPagination?.currentPage || 1,
    limit: initialPagination?.limit || 10,
  });

  const fetchPage = async (page) => {
    const res = await fetch(
      `/api/db/box?page=${page}&limit=${pagination.limit}`,
    );
    if (!res.ok) return;
    const data = await res.json();
    if (data?.items) {
      setItems(data.items);
      setPagination((p) => ({
        ...p,
        pages: data.pages ?? p.pages,
        currentPage: page,
      }));
    }
  };

  const columns = [
    {
      header: "ID",
      key: "id",
      className: "max-w-[20px] text-slate-300",
      type: "text",
    },
    { header: "Повідомлення", key: "text", type: "textarea" },
    { header: "Дата", key: "date", type: "text" },
  ];

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <div>
          <p className={s.section}>Адмінка</p>
          <h1 className={s.title}>Box</h1>
          <p className={s.description}>Список повідомлень з таблиці box.</p>
        </div>
        <div className={s.status}>
          {status === "saving"
            ? "Зберігається..."
            : status === "saved"
              ? "Збережено"
              : status === "error"
                ? "Помилка"
                : ""}
        </div>
      </div>

      <div className={s.tableWrapper}>
        <UniversalTable
          data={items}
          columns={columns}
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
