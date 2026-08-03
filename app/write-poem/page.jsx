"use client";

import { Button } from "@/components/ui/button";
import s from "./write-poem.module.css";
import { Send } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";

const WritePoem = () => {
  const { data: session, status } = useSession();
  const [checkBox, setCheckBox] = useState(false);

  useEffect(() => {
    console.log(status);
  }, [session]);

  const sendForm = async (form) => {
    const authorId = checkBox? 0 : session?.user?.id;
    const author = form.get("author");
    const title = form.get("title");
    const text = form.get("text");

    try {
      const response = await fetch("/api/tg-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${title}\n\n${text}\n\nID: ${authorId} ${author}` }),
      });

      if (!response.ok) {
        throw new Error("Помилка сервера");
      }

      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.log(err);
    }

    const handleSubmit = async () => {
      const res = await fetch("/api/db/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: authorId,
          title: title,
          content: `${text} ${author && author.length != 0? `\n\n` + author : ''}`,
        }),
      });

      if (res.ok) {
        toast.add({
          type: "success",
          description: "Вірш успішно збережено!",
        });
      } else {
        document.querySelector('form [name="text"]').value = text;

        toast.add({
          type: "error",
          description: "Вірш НЕ збережено!",
        });
      }
    };
    handleSubmit(text);
  };

  if (status == "loading") return <Loader />;

  return (
    <form className={s.form} action={sendForm}>
      <div className={s.textBox}>
        <div className={s.inputs}>

        <div className="flex gap-4">
          Анонімно?
      <button
        type="button"
        onClick={() => setCheckBox(true)}
        className={s.checkBtn + ` rounded-md text-[.7em] font-bold transition-all ${
          checkBox
            ? s.active + " text-green-800"
            : "text-gray-600"
        }`}
      >
        Так
      </button>

      <button
        type="button"
        onClick={() => setCheckBox(false)}
        className={s.checkBtn + ` rounded-md text-[.7em] font-bold transition-all ${
          !checkBox
            ? s.active + " text-red-800"
            : "text-gray-600"
        }`}
      >
        Ні
      </button>
    </div>

        <input className={s.input} type="text" name="title" placeholder="Заголовок" required /></div>
        <textarea
          className={s.textArea}
          name="text"
          placeholder="Ваш вірш"
          required
        ></textarea>
      </div>
      <div className={s.formNav}>
        <Button type="submit">
          <Send /> Надіслати
        </Button>
      </div>
    </form>
  );
};

export default WritePoem;
