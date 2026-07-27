import { BookOpen, Home, Pencil } from "lucide-react";

export const NAV_CONFIG = [
  {
    items: [
      {
        title: "Головна",
        url: "/",
        icon: Home,
        roles: ["user"],
      },
    ],
  },
  {
    title: "Огляд",
    items: [
      {
        title: "Вірші",
        url: "/poems",
        icon: BookOpen,
        roles: ["user"],
      },
      // {
      //   title: "Мої Вірші",
      //   url: "#",
      //   icon: Bookmark,
      //   roles: ["user"],
      // },
    ],
  },
  {
    title: "Написати",
    items: [
      {
        title: "Вірш",
        url: "/write-poem",
        icon: Pencil,
        roles: ["user"],
      },
      // {
      //   title: "В скриню",
      //   url: "#",
      //   icon: Inbox,
      //   roles: ["user"],
      // },
    ],
  },
  // {
  //   title: "Інформація",
  //   items: [
  //     {
  //       title: "API",
  //       url: "/api",
  //       icon: Webhook,
  //       roles: ["admin", "creator"],
  //     },
  //   ],
  // },
];
