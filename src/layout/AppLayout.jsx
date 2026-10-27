import { useEffect, useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import LogoutModal from "./Header/LogoutModal";
import { STORAGE_CONFIG } from "@config/storage.config";

function AppLayout({ children }) {
  // Mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Desktop collapse (icon-only) vs expanded, persisted
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_CONFIG.SIDEBAR_COLLAPSED) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_CONFIG.SIDEBAR_COLLAPSED, collapsed);
  }, [collapsed]);

  // Single toggle handler — different effect depending on screen size
  const handleSidebarToggle = () => {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      setCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        onLogout={() => setShowLogoutModal(true)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Header
          onSidebarToggle={handleSidebarToggle}
          onLogout={() => setShowLogoutModal(true)}
        />

        <main className="flex-1 w-full max-w-10xl mx-auto">
          <div className="w-full px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}

export default AppLayout;
