"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "./ui/sidebar";
import { ToastProvider } from "./ui/toast";

const AllProviders = ({ children }) => {
  return (
    <SessionProvider>
      <SidebarProvider>
        <ToastProvider>{children}</ToastProvider>
      </SidebarProvider>
    </SessionProvider>
  );
};

export default AllProviders;
