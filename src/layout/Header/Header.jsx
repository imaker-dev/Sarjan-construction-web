import HeaderAppsMenu from "./HeaderAppsMenu";
import { IconMenu2 } from "@tabler/icons-react";
import ProfileDropdown from "./ProfileDropdown";
import ThemeToggle from "./ThemeToggle";
import HeaderSearch from "./HeaderSearch";
import HeaderNotifications from "./HeaderNotifications";

function Header({ onSidebarToggle, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-1">
          {/* Sidebar Toggle */}
          <button
            type="button"
            onClick={onSidebarToggle}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all duration-200 ease-in-out hover:bg-primary-50 hover:text-primary-500 dark:text-gray-200 dark:hover:bg-primary-900/40 dark:hover:text-primary-300"
            aria-label="Toggle sidebar"
          >
            <IconMenu2 className="h-5 w-5" />
          </button>

          {/* Search */}
          <HeaderSearch />

          {/* Apps - Left on desktop */}
          <div className="hidden sm:block">
            <HeaderAppsMenu />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Apps - Right on mobile */}
          <div className="block sm:hidden">
            <HeaderAppsMenu />
          </div>
          <ThemeToggle />

          <HeaderNotifications />

          {/* Profile */}
          <ProfileDropdown onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}

export default Header;
