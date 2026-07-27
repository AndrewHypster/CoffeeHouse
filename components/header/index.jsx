import Link from "next/link";
import { Button } from "../ui/button";
import s from "./header.module.css";

const Header = () => {
  return (
    <header className={s.header}>
      <div className={s.logo}>CoffeeHouse</div>
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
