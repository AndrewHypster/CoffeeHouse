import { BookOpen, Home, Pencil, User } from "lucide-react";

export const NAV_CONFIG = [
  {
    title: "Огляд",
    items: [
      {
        title: "Головна",
        url: "/",
        icon: Home,
        roles: ['guest', "user"],
      },
      {
        title: "Кабінет",
        url: "/profile",
        icon: User,
        roles: ["user"],
      },
      {
        title: "Вірші",
        url: "/poems",
        icon: BookOpen,
        roles: ['guest', "user"],
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
        roles: ['guest', "user"],
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
