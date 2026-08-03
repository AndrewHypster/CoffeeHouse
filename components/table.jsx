"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const TextCell = ({ value }) => {
  let normalized = value;

  if (value === null || value === undefined) {
    normalized = "—";
  } else if (value instanceof Date) {
    normalized = value.toLocaleString();
  } else if (typeof value === "object") {
    normalized = Array.isArray(value)
      ? value.join(", ")
      : JSON.stringify(value);
  } else {
    normalized = String(value);
  }

  return <span className="text-sm text-[var(--table-text)]">{normalized}</span>;
};

const BadgeIconCell = ({ value, config, colKey, onClick }) => {
  config = config[value[colKey]];
  const Icon = config?.icon;

  return (
    <button
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-1.5 transition-transform active:scale-95"
    >
      <Badge variant="outline" className={`${config?.css} border-current/20`}>
        {config && <Icon className="mr-1 size-3" />}
        {config?.label}
      </Badge>
    </button>
  );
};

const BadgeDotCell = ({ value, config, colKey, onClick }) => {
  config = config[value[colKey]];

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider transition-all hover:opacity-80 active:scale-95 ${config?.css}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config?.dot}`} />
      {config?.label}
    </button>
  );
};

const TableRowMemo = React.memo(({ columns, item, openModal }) => (
  <TableRow>
    {columns.map((col, i) => {
      const value = item[col.key];
      const editable = col.editable;

      const handleOpenModal = () => {
        if (!editable) return;

        openModal({
          id: item.id,
          title: col.header,
          colKey: col.key,
          currentValue: value,
          username: item.name || `${item.firstName} ${item.lastName}`,
          options: col.options,
          type: col.type,
        });
      };

      return (
        <TableCell
          className={cn(
            col.className,
            editable
              ? "cursor-pointer transition-colors hover:bg-[var(--table-row-hover)]"
              : "",
          )}
          key={i}
          onClick={handleOpenModal}
        >
          {(() => {
            if (col.render) return col.render(item);

            switch (col.type) {
              case "badge-icon":
                return (
                  <BadgeIconCell
                    value={item}
                    config={col.config}
                    colKey={col.key}
                    onClick={(event) => {
                      event.stopPropagation();
                      openModal({
                        id: item.id,
                        title: col.header,
                        colKey: col.key,
                        currentValue: value,
                        username:
                          item.name || `${item.firstName} ${item.lastName}`,
                        options: Object.entries(col.config || {}).map(
                          ([key, info]) => ({
                            value: key,
                            label: info.label,
                          }),
                        ),
                        type: col.type,
                      });
                    }}
                  />
                );

              case "text":
                return <TextCell value={value} />;

              case "badge-dot":
                return (
                  <BadgeDotCell
                    value={item}
                    config={col.config}
                    colKey={col.key}
                    onClick={(event) => {
                      event.stopPropagation();
                      openModal({
                        id: item.id,
                        title: col.header,
                        colKey: col.key,
                        currentValue: value,
                        username:
                          item.name || `${item.firstName} ${item.lastName}`,
                        options: Object.entries(col.config || {}).map(
                          ([key, info]) => ({
                            value: key,
                            label: info.label,
                          }),
                        ),
                        type: col.type,
                      });
                    }}
                  />
                );

              default:
                return <TextCell value={value} />;
            }
          })()}
        </TableCell>
      );
    })}
  </TableRow>
));

export function UniversalTable({
  data,
  columns,
  onChange,
  filtering,
  pagination,
}) {
  const [modal, setModal] = useState(null);

  const openModal = ({
    id,
    title,
    colKey,
    username,
    currentValue,
    options,
  }) => {
    setModal({ id, title, colKey, username, currentValue, options });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((item, key) => (
            <TableRowMemo
              key={item.id}
              columns={columns}
              item={item}
              openModal={openModal}
            />
          ))}
        </TableBody>
      </Table>

      {/* ПАНЕЛЬ ПАГІНАЦІЇ */}
      {pagination && (
        <div className="flex items-center justify-center rounded-b-xl border-t  p-4 shadow-sm border-white/[0.08] bg-white/[0.04] backdrop-blur-md">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Стрілка Назад */}
            <Button
              variant="outline"
              className={cn(
                "flex h-9 w-9 items-center justify-center p-0 border transition-colors",
                pagination.currentPage === 1
                  ? "opacity-40 cursor-not-allowed border-gray-700 text-gray-500 bg-transparent"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-200 dark:hover:bg-white/[0.02]",
              )}
              disabled={pagination.currentPage === 1}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>

            {/* Розрахунок лінійки сторінок прямо в рендері */}
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.pages ||
                  Math.abs(p - pagination.currentPage) <= 1,
              )
              .map((p, idx, arr) => {
                const showDots = idx > 0 && p - arr[idx - 1] > 1;
                const isCurrent = p === pagination.currentPage;

                return (
                  <React.Fragment key={p}>
                    {showDots && (
                      <span className="flex h-9 w-8 items-center justify-center text-sm font-medium text-gray-400 dark:text-gray-500">
                        •••
                      </span>
                    )}
                    <Button
                      variant={isCurrent ? "default" : "outline"}
                      className={`h-9 min-w-[36px] px-2 text-sm font-medium transition-all ${
                        isCurrent
                          ? "text-white shadow-sm"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.02]"
                      }`}
                      style={
                        isCurrent
                          ? {
                              backgroundColor: "#7C1DF2",
                              borderColor: "#7C1DF2",
                            }
                          : {}
                      }
                      onClick={() => pagination.onPageChange(p)}
                    >
                      {p}
                    </Button>
                  </React.Fragment>
                );
              })}

            {/* Стрілка Вперед */}
            <Button
              variant="outline"
              className={cn(
                "flex h-9 w-9 items-center justify-center p-0 border transition-colors",
                pagination.isNextDisabled
                  ? "opacity-40 cursor-not-allowed border-gray-700 text-gray-500 bg-transparent"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-200 dark:hover:bg-white/[0.02]",
              )}
              disabled={pagination.isNextDisabled}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}
      {/* МОДАЛЬНЕ ВІКНО ЗМІНИ РОЛІ */}
      {modal && (
        <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{modal?.title}</DialogTitle>
              <DialogDescription>Встановіть нове значення</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {modal.options && modal.options.length > 0 ? (
                <Select
                  value={modal.currentValue ?? ""}
                  onValueChange={(val) =>
                    setModal((prev) =>
                      prev ? { ...prev, currentValue: val } : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть значення" />
                  </SelectTrigger>
                  <SelectContent>
                    {modal.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : modal.type === "textarea" || modal.colKey === "content" ? (
                <textarea
                  value={modal.currentValue ?? ""}
                  onChange={(event) =>
                    setModal((prev) =>
                      prev
                        ? { ...prev, currentValue: event.target.value }
                        : null,
                    )
                  }
                  placeholder="Введіть нове значення"
                  className="w-full min-h-[160px] p-2 rounded border bg-[var(--table-bg)] text-[var(--table-text)]"
                />
              ) : (
                <Input
                  value={modal.currentValue ?? ""}
                  onChange={(event) =>
                    setModal((prev) =>
                      prev
                        ? { ...prev, currentValue: event.target.value }
                        : null,
                    )
                  }
                  placeholder="Введіть нове значення"
                />
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModal(null)}>
                Скасувати
              </Button>
              <Button
                onClick={() => {
                  onChange({
                    id: modal.id,
                    key: modal.colKey,
                    value: modal.currentValue,
                  });
                  setModal(null);
                }}
              >
                Зберегти зміни
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export const EmptyTable = ({ page, totalPages, handlePageChange }) => {
  return (
    <div className="my-4 rounded-xl border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
      <div className="mb-2 text-lg font-semibold text-red-500">
        ⚠ Помилка навігації
      </div>
      <p className="text-sm text-gray-600">
        Ви перейшли на сторінку
        <span className="font-bold text-red-600">{page}</span>, але в базі даних
        зараз доступно всього
        <span className="font-semibold text-gray-900">{totalPages}</span>
        сторінок.
      </p>
      <button
        onClick={() => handlePageChange(1)}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-red-700"
      >
        Повернутися на 1 сторінку
      </button>
    </div>
  );
};
