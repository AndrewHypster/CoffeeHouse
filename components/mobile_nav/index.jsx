"use client";

import s from "./mobile_nav.module.css";
import { Home, Plus, Search, Trophy, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";

const MobileNavigation = () => {
  const [add, setAdd] = useState(false);
  const addRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        addRef.current &&
        !addRef.current.contains(e.target)
      ) {
        setAdd(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  return (
    <nav className={s.nav}>
      <Link href="/poems">
        <Home />
      </Link>

      <Link href="/search">
        <Search />
      </Link>

      <div ref={addRef}>
        <Button onClick={() => setAdd(!add)}>
          <Plus />
        </Button>

        <div className={`${s.addList} ${add ? s.active : ""}`}>
          <Link href="/write-box" onClick={() => setAdd(!add)}>
            В скриньку
          </Link>

          <div className={s.hr}></div>

          <Link href="/write-poem" onClick={() => setAdd(!add)}>
            Новий вірш
          </Link>
        </div>
      </div>

      <Link href="/leaders">
        <Trophy />
      </Link>

      <Link href="/profile">
        <User />
      </Link>
    </nav>
  );
};

export default MobileNavigation;