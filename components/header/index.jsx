"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import s from "./header.module.css";
import { Button } from "../ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

const Header = () => {
  const { status } = useSession();

  return (
    <header className={s.header}>
      <div className="flex gap-2">
        <div className={s.left}>
          <SidebarTrigger />
        </div>
        <div className={s.logo}>
          <Link href="/">CoffeeHouse</Link>
        </div>
      </div>

      {/* <nav className={s.nav}>
        <Link className={s.link} href="/poems">
          Вірші
        </Link>
        <Link className={s.link} href="/write-poem">
          Написати вірш
        </Link>
      </nav> */}
      {status === "loading" ? (
        <></>
      ) : status === "authenticated" ? (
        <Button className='w-fit ml-[auto]' onClick={() => signOut({ callbackUrl: "/" })}>
          Вийти <LogOut />
        </Button>
      ) : (
        <Button className='w-fit ml-[auto]' onClick={() => signIn("google", { callbackUrl: "/" })}>
          Увійти <LogIn />
        </Button>
      )}
    </header>
  );
};

export default Header;
