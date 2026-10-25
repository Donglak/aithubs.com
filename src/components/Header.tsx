import {
  LayoutDashboard,
  LogOut,
  Menu,
  Store,
  X,
  Zap,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { user, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/tools", label: "Tools" },
    { to: "/blog", label: "Blog" },
    { to: "/courses", label: "Course" },
    { to: "/ebooks", label: "Ebooks" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/become-vendor", label: "Sell" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.email || "U"
    )}&background=6366f1&color=fff`;

  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const shortName = displayName.split(" ").pop() || displayName;

  const submitSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/tools?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setSearchOpen(false);
    setIsMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-3">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 shrink-0 items-center gap-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500">
              <Zap className="h-5 w-5 text-white" />
            </span>
            <span className="truncate text-xl font-bold text-gray-900 dark:text-white">
              AIThub
            </span>
          </Link>

          <nav
            className="ml-4 hidden min-w-0 flex-1 items-center justify-center gap-4 xl:gap-6 lg:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap text-sm transition-colors ${
                  isActive(link.to)
                    ? "font-medium text-primary-600 dark:text-primary-400"
                    : "text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <div className="relative w-36 xl:w-44">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submitSearch()}
                placeholder="Search tools..."
                aria-label="Search tools"
                className="w-full rounded-lg border-0 bg-gray-100 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              type="button"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-expanded={isUserMenuOpen}
                  type="button"
                >
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border-2 border-primary-400 object-cover"
                  />
                  <span className="max-w-20 truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                    {shortName}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                      <p className="truncate text-xs text-gray-400">{user.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
                      <LayoutDashboard className="h-4 w-4" /> My Dashboard
                    </Link>
                    <Link to="/vendor" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
                      <Store className="h-4 w-4" /> Vendor Dashboard
                    </Link>
                    <button onClick={() => { signOut(); setIsUserMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10" type="button">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Sign In
              </Link>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <button
              onClick={() => setSearchOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Open search"
              type="button"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              type="button"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user && (
              <Link to="/dashboard" onClick={closeMobileMenu} className="shrink-0">
                <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full border-2 border-primary-400 object-cover" />
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              type="button"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-gray-200 py-3 lg:hidden dark:border-gray-700">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submitSearch()}
                placeholder="Search tools..."
                aria-label="Search tools"
                className="w-full rounded-lg bg-gray-100 py-3 pl-9 pr-3 text-base text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 lg:hidden">
          <nav className="space-y-1 px-4 py-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={`flex min-h-11 items-center rounded-lg px-3 text-base transition-colors ${
                  isActive(link.to)
                    ? "bg-primary-50 font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <LanguageSwitcher />
              <button
                onClick={() => {
                  toggleTheme();
                  closeMobileMenu();
                }}
                className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                type="button"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>

              {user ? (
                <>
                  <Link to="/dashboard" onClick={closeMobileMenu} className="mt-2 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    <LayoutDashboard className="h-4 w-4" /> My Dashboard
                  </Link>
                  <Link to="/vendor" onClick={closeMobileMenu} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    <Store className="h-4 w-4" /> Vendor Dashboard
                  </Link>
                  <button onClick={() => { signOut(); closeMobileMenu(); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10" type="button">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={closeMobileMenu} className="mt-3 block rounded-lg bg-primary-600 px-4 py-3 text-center font-semibold text-white hover:bg-primary-700">
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
