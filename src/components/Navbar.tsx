import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Heart,
  Sun,
  Moon,
  Scale,
  Building2,
  X,
} from "lucide-react";
import type { Category } from "../types";

const NAV_CATEGORIES: (Category | "All")[] = [
  "All",
  "iPhone",
  "MacBook",
  "Smartwatch",
  "Android",
];

interface NavbarProps {
  query: string;
  onQuery: (v: string) => void;
  category: Category | "All";
  onCategory: (c: Category | "All") => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  compareCount: number;
  onOpenCompare: () => void;
}

export default function Navbar({
  query,
  onQuery,
  category,
  onCategory,
  theme,
  onToggleTheme,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  compareCount,
  onOpenCompare,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand monogram */}
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25">
            <Building2 size={18} strokeWidth={2} />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              Chicago Gadgets
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Premium Tech
            </span>
          </span>
        </a>

        {/* Search */}
        <div className="relative ml-1 hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search iPhones, MacBooks, watches..."
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-900"
          />
          {query && (
            <button
              onClick={() => onQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <IconButton label="Compare" onClick={onOpenCompare} count={compareCount}>
            <Scale size={19} strokeWidth={1.8} />
          </IconButton>
          <IconButton label="Wishlist" onClick={onOpenWishlist} count={wishlistCount}>
            <Heart size={19} strokeWidth={1.8} />
          </IconButton>
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {theme === "dark" ? (
              <Sun size={19} strokeWidth={1.8} />
            ) : (
              <Moon size={19} strokeWidth={1.8} />
            )}
          </button>

          {/* Cart */}
          <motion.button
            key={cartCount}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 0.35 }}
            onClick={onOpenCart}
            className="relative ml-1 flex h-10 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <ShoppingCart size={17} strokeWidth={2} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-500 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </motion.button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="ml-1 grid h-10 w-10 place-items-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {mobileOpen ? <X size={20} /> : <Search size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-zinc-800">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search devices..."
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      )}

      {/* Category tabs */}
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto pb-2 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => onCategory(c)}
                className={
                  "relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100")
                }
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{c}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

function IconButton({
  children,
  onClick,
  count,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  count: number;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative hidden h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 sm:grid dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {children}
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
