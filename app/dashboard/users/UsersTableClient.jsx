"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UniversalTable } from "@/components/table";
import s from "./users.module.css";

const roleOptions = [
  { value: "user", label: "user" },
  { value: "admin", label: "admin" },
];

export default function UsersTableClient({ users: initialUsers }) {
  const { data: session, update } = useSession();
  const [users, setUsers] = useState(initialUsers);
  const [status, setStatus] = useState("");

  const handleChange = async ({ id, key, value }) => {
    if (value === undefined || value === null) return;

    setStatus("saving");

    const response = await fetch("/api/db/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, [key]: value }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    const data = await response.json();

    if (data?.user) {
      setUsers((prev) =>
        prev.map((user) => (user.id === data.user.id ? data.user : user)),
      );

      if (session?.user?.id === data.user.id) {
        await update();
      }

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
      className: "w-[80px] text-slate-300",
      type: "text",
    },
    {
      header: "Ім'я",
      key: "name",
      type: "text",
      editable: true,
    },
    {
      header: "Електронна пошта",
      key: "mail",
      type: "text",
      editable: true,
    },
    {
      header: "Роль",
      key: "role",
      type: "text",
      editable: true,
      options: roleOptions,
    },
    {
      header: "Дата створення",
      key: "createdAt",
      type: "text",
    },
  ];

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <div>
          <p className={s.section}>Адмінка</p>
          <h1 className={s.title}>Користувачі</h1>
          <p className={s.description}>
            Натисніть на значення, щоб змінити ім’я, пошту або роль. Зміни
            збережуться в базі.
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
          data={users}
          columns={columns}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
