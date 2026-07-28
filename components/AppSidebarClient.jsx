'use client'

import dynamic from "next/dynamic";
import React from "react";

const AppSidebar = dynamic(
  () => import("./app-sidebar").then((mod) => mod.AppSidebar),
  { ssr: false },
);

export default function AppSidebarClient(props) {
  return <AppSidebar {...props} />;
}
