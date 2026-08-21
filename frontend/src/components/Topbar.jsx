import { FaBell, FaBars } from "react-icons/fa";

function TopBar({ userRole, schoolName, onToggleSidebar }) {
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const displayName = userRole === "admin" ? schoolName || "Admin" : "Teacher";
  const initial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-gray-500 hover:text-gray-700 lg:hidden shrink-0"
        >
          <FaBars size={20} />
        </button>

        <p className="text-sm text-gray-400 hidden sm:block truncate">
          {todayLabel}
        </p>
      </div>

      <div className="flex items-center gap-4 md:gap-6 shrink-0">
        <button
          type="button"
          className="relative text-gray-400 hover:text-gray-600 transition"
        >
          <FaBell size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
            {initial}
          </div>
          <div className="text-sm leading-tight hidden sm:block">
            <p className="font-semibold text-gray-800">{displayName}</p>
            <p className="text-gray-400 text-xs capitalize">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;