import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Home, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import ThemeToggle from "../components/common/ThemeToggle";
import { logout } from "../redux/slices/authSlice";
import { dismissNotification } from "../redux/slices/uiSlice";
import { ROUTES } from "../utils/constants";

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const notifications = useSelector((state) => state.ui.notifications);
  const adminName = (user?.name || "Admin").trim().split(/\s+/)[0];

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    if (bellOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bellOpen]);

  const btnClass =
    "rounded-xl border border-slate-300/70 bg-white/70 p-2 text-slate-700 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200";

  return (
    <div className="container-4k py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-poppins text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Welcome back, {adminName}.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/35 dark:text-rose-200">
            Role: Admin
          </span>
        </div>

        {/* Action buttons: Home → Toggle → Bell → Logout */}
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          {/* Home */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.HOME)}
            aria-label="Go to home page"
            title="Home"
            className={btnClass}
          >
            <Home size={18} />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell */}
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setBellOpen((prev) => !prev)}
              aria-label="Notifications"
              title="Notifications"
              className={btnClass}
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200/70 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <Bell size={15} />
                      Notifications
                    </h4>
                    <span className="rounded-full bg-brand-indigo/10 px-2 py-0.5 text-[11px] font-medium text-brand-indigo dark:bg-brand-indigo/20">
                      {notifications.length}
                    </span>
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                        All caught up. No new notifications.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-700/60 dark:bg-slate-800/60"
                        >
                          <p className="text-xs text-slate-700 dark:text-slate-200">
                            {n.message}
                          </p>
                          <button
                            type="button"
                            onClick={() => dispatch(dismissNotification(n.id))}
                            className="shrink-0 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              navigate(ROUTES.HOME);
            }}
            className="rounded-xl border border-slate-300/80 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
          >
            <span className="inline-flex items-center gap-1">
              <LogOut size={14} />
              Logout
            </span>
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
