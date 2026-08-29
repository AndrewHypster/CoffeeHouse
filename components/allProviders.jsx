"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "./ui/sidebar";
import { ToastProvider } from "./ui/toast";
import { CommentsProvider } from "./comments/provider";

const AllProviders = ({ children }) => {
  return (
    <SessionProvider>
      <SidebarProvider>
        <CommentsProvider>
          <ToastProvider>{children}</ToastProvider>
        </CommentsProvider>
      </SidebarProvider>
    </SessionProvider>
  );
};

export default AllProviders;
