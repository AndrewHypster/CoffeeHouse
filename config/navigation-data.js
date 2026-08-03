// Data-only navigation config usable in server/runtime (middleware) and client.
export const NAV_CONFIG = [
  {
    title: "Огляд",
    items: [
      {
        title: "Головна",
        url: "/",
        icon: "Home",
        roles: ["guest", "user", "admin"],
      },
      { title: "Адмінка", url: "/dashboard", icon: "Shield", roles: ["admin"] },
      {
        title: "Кабінет",
        url: "/profile",
        icon: "User",
        roles: ["user", "admin"],
      },
      {
        title: "Вірші",
        url: "/poems",
        icon: "BookOpen",
        roles: ["guest", "user", "admin"],
      },
    ],
  },
  {
    title: "Написати",
    items: [
      {
        title: "Вірш",
        url: "/write-poem",
        icon: "Pencil",
        roles: ["guest", "user", "admin"],
      },
    ],
  },
];

export function getAllRoutes() {
  const routes = new Set();
  NAV_CONFIG.forEach((group) => {
    group.items.forEach((it) => routes.add(it.url));
  });
  // ensure dashboard wildcard is included if dashboard exists
  if ([...routes].some((r) => r === "/dashboard")) {
    routes.add("/dashboard/:path*");
  }
  return Array.from(routes);
}

// Static routes array (explicit literal) for build-time/static analysis (used by middleware)
export const ROUTES = [
  "/",
  "/poems",
  "/write-poem",
  "/profile",
  "/dashboard",
  "/dashboard/:path*",
];
