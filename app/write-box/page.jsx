"use client";

import { Button } from "@/components/ui/button";
import s from "../write-poem/write-poem.module.css";
import { Send } from "lucide-react";
import { toast } from "@/components/ui/toast";

const WriteBox = () => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = formData.get("text");

    try {
      const response = await fetch("/api/db/box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Помилка сервера");
      }

      toast.add({
        type: "success",
        description: "Повідомлення успішно збережено!",
      });
    } catch (err) {
      console.log(err);
      toast.add({
        type: "error",
        description: "Повідомлення НЕ збережено!",
      });
    }
  };

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s.textBox}>
        <textarea
          className={s.textArea}
          name="text"
          placeholder="Ваш текст"
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

export default WriteBox;
