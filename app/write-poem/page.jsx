"use client";

import { Button } from "@/components/ui/button";
import s from "./write-poem.module.css";
import { Send } from "lucide-react";

const WritePoem = () => {
  const sendForm = async (form) => {
    const text = form.get("text");

    try {
      const response = await fetch("/api/tg-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error("Помилка сервера");

      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form className={s.form} action={sendForm}>
      <div className={s.textBox}>
        <textarea className={s.textArea} name="text" placeholder="Ваш вірш" required></textarea>
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
