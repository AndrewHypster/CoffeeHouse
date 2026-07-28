"use client";

import { Button } from "@/components/ui/button";
import s from "./write-poem.module.css";
import { Send } from "lucide-react";
import { toast } from "@/components/ui/toast";

const WritePoem = () => {
  const sendForm = async (form) => {
    const author = form.get("author");
    const title = form.get("title");
    const text = form.get("text");

    try {
      const response = await fetch("/api/tg-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${title}\n\n${text}\n\n${author}` }),
      });

      if (!response.ok) {
        throw new Error("Помилка сервера");
      }

      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.log(err);
    }

    const handleSubmit = async (text) => {
      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author,
          title: title,
          content: text,
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

  return (
    <form className={s.form} action={sendForm}>
      <div className={s.textBox}>
        <input type="text" name="author" placeholder="Автор ПІП" required />
        <input type="text" name="title" placeholder="Заголовок" required />
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
