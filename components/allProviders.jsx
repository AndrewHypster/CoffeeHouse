import { SidebarProvider } from "./ui/sidebar";
import { ToastProvider } from "./ui/toast";

const AllProviders = ({ children }) => {
  return (
    <SidebarProvider>
      <ToastProvider>{children}</ToastProvider>
    </SidebarProvider>
  );
};

export default AllProviders;
