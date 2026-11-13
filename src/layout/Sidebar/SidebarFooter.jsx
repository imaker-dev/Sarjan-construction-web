import Avatar from "@components/ui/Avatar";
import { IconPower } from "@tabler/icons-react";
import { useSelector } from "react-redux";

function SidebarFooter({ collapsed, onLogout }) {
  const { meData } = useSelector((state) => state.auth);
  const { displayName, role } = meData || {};
  return (
    <div className="shrink-0 p-4 lg:p-5">
      <div
        className={`flex items-center transition-all duration-300 ${
          collapsed
            ? "justify-center p-2"
            : "gap-3 rounded-2xl bg-secondary-500/10 px-3.5 py-3 dark:bg-secondary-500/10"
        }`}
      >
        <Avatar name={displayName || "Guest"} size={38} />

        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-[14px] font-semibold text-gray-800 dark:text-white">
                {displayName || "Guest"}
              </p>

              <p className="truncate text-[12.5px] text-gray-500 dark:text-white/90">
                {role || "Member"}
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="shrink-0 rounded-full p-1.5 text-gray-500 transition-all duration-200 hover:bg-white hover:text-primary-600 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-primary-300"
              aria-label="Logout"
            >
              <IconPower className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SidebarFooter;
