"use client";

import { useState } from "react";
import { UniversalTable } from "@/components/table";
import s from "./box.module.css";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BoxTableClient({
  boxItems: initialBoxItems,
  pagination: initialPagination,
}) {
  const [items, setItems] = useState(initialBoxItems || []);
  const [status, setStatus] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
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
    {
      header: "Повідомлення",
      key: "text",
      className: "max-w-[200px] text-slate-300",
      render: (item) => (
        <button
          type="button"
          className={s.textPreview}
          onClick={() => setSelectedMessage(item.text)}
        >
          {item.text}
        </button>
      ),
    },
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

      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Повне повідомлення</DialogTitle>
            <DialogDescription>
              Натисніть закрити або поза вікном, щоб повернутися назад.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-auto rounded-lg border border-border bg-background p-4 text-sm text-foreground">
            {selectedMessage}
          </div>

          <DialogFooter>
            <DialogClose className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
              Закрити
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
