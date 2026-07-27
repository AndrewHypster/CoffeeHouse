"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import s from "./header.module.css";

const Header = () => {
  return (
    <header className={s.header}>
      <div className="flex gap-2">
        <div className={s.left}>
        <SidebarTrigger />
      </div>
      <div className={s.logo}><Link href='/'>CoffeeHouse</Link></div>
      </div>
      
      <nav className={s.nav}>
        <Link className={s.link} href="/poems">
          Вірші
        </Link>
        <Link className={s.link} href="/write-poem">
          Написати вірш
        </Link>
      </nav>
    </header>
  );
};

export default Header;
