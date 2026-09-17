import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SlidersHorizontal,
  RotateCcw,
  X,
  Heart,
  Scale,
  History,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  BadgeCheck,
  MapPin,
  Building2,
  Star,
} from "lucide-react";
import type {
  Category,
  Brand,
  Condition,
  Product,
  CartItem,
  Order,
  SortKey,
} from "./types";
import {
  PRODUCTS,
  BRANDS,
  CONDITIONS,
  PRICE_CEILING,
} from "./data/products";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import CartAndCheckoutModal from "./components/CartAndCheckoutModal";

type Drawer = null | "wishlist" | "compare" | "orders";

const LS = {
  theme: "cg_theme",
  wish: "cg_wishlist",
  orders: "cg_orders",
};

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(LS.theme) as "light" | "dark") || "dark";
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [condition, setCondition] = useState<Condition | "All">("All");
  const [maxPrice, setMaxPrice] = useState(PRICE_CEILING);
  const [sort, setSort] = useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [toast, setToast] = useState<string | null>(null);

  /* ---- theme ---- */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(LS.theme, theme);
  }, [theme]);

  /* ---- hydrate persisted ---- */
  useEffect(() => {
    try {
      const w = JSON.parse(localStorage.getItem(LS.wish) || "[]");
      if (Array.isArray(w)) setWishlist(w);
      const o = JSON.parse(localStorage.getItem(LS.orders) || "[]");
      if (Array.isArray(o)) setOrders(o);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS.wish, JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  /* ---- cart ops ---- */
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.lineId === item.lineId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          quantity: Math.min(copy[idx].product.stock, copy[idx].quantity + item.quantity),
        };
        return copy;
      }
      return [...prev, item];
    });
    showToast(`${item.product.name} added to cart`);
  };

  const quickAdd = (p: Product) => {
    const storage = p.storage[0];
    const color = p.colors[0];
    addToCart({
      lineId: `${p.id}::${storage.label}::${color.name}`,
      product: p,
      storage,
      color,
      quantity: 1,
      unitPrice: p.basePrice + storage.priceDelta,
    });
  };

  const setQty = (lineId: string, qty: number) =>
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.lineId !== lineId)
        : prev.map((i) => (i.lineId === lineId ? { ...i, quantity: qty } : i)),
    );

  const removeItem = (lineId: string) =>
    setCart((prev) => prev.filter((i) => i.lineId !== lineId));

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  /* ---- wishlist / compare ---- */
  const toggleWishlist = (id: string) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));

  const toggleCompare = (id: string) =>
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 3) {
        showToast("Compare holds up to 3 devices");
        return prev;
      }
      return [...prev, id];
    });

  /* ---- filtering + sorting ---- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (condition !== "All" && p.condition !== condition) return false;
      if (p.basePrice > maxPrice) return false;
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.category} ${p.tagline}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
    }
    return list;
  }, [query, category, brands, condition, maxPrice, sort]);

  const featured = useMemo(() => PRODUCTS.filter((p) => p.featured).slice(0, 4), []);

  const resetFilters = () => {
    setBrands([]);
    setCondition("All");
    setMaxPrice(PRICE_CEILING);
    setCategory("All");
    setSort("featured");
    setQuery("");
  };

  const scrollToCatalog = () =>
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });

  const compareProducts = compare
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const wishProducts = wishlist
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setDrawer("wishlist")}
        compareCount={compare.length}
        onOpenCompare={() => setDrawer("compare")}
      />

      <Hero onExplore={scrollToCatalog} onDeals={() => { setSort("price-asc"); scrollToCatalog(); }} />

      {/* Trust strip */}
      <section className="border-b border-slate-100 bg-slate-50/60 dark:border-zinc-900 dark:bg-zinc-900/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: <Truck size={20} />, t: "Same-day delivery", s: "Anywhere in Chicago" },
            { icon: <BadgeCheck size={20} />, t: "Certified devices", s: "128-point inspection" },
            { icon: <ShieldCheck size={20} />, t: "2-year warranty", s: "Chicago-backed" },
            { icon: <MapPin size={20} />, t: "Loop flagship", s: "In-store pickup" },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                {f.icon}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{f.t}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{f.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              <Sparkles size={14} /> Editor&apos;s picks
            </span>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-zinc-50">
              Featured gadgets
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              onOpen={setSelected}
              onAdd={quickAdd}
              onToggleWishlist={toggleWishlist}
              wishlisted={wishlist.includes(p.id)}
              onToggleCompare={toggleCompare}
              comparing={compare.includes(p.id)}
            />
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              {category === "All" ? "All devices" : category + "s"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {filtered.length} product{filtered.length === 1 ? "" : "s"} available
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 lg:hidden dark:border-zinc-700 dark:text-zinc-200"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top rated</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-6 rounded-2xl border border-slate-100 p-5 dark:border-zinc-800">
              <FilterPanel
                brands={brands}
                setBrands={setBrands}
                condition={condition}
                setCondition={setCondition}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 py-24 text-center dark:border-zinc-800">
                <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                  No devices match your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <RotateCcw size={14} /> Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {filtered.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={i}
                    onOpen={setSelected}
                    onAdd={quickAdd}
                    onToggleWishlist={toggleWishlist}
                    wishlisted={wishlist.includes(p.id)}
                    onToggleCompare={toggleCompare}
                    comparing={compare.includes(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer onOrders={() => setDrawer("orders")} />

      {/* Mobile filter drawer */}
      <DrawerShell open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <FilterPanel
          brands={brands}
          setBrands={setBrands}
          condition={condition}
          setCondition={setCondition}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onReset={resetFilters}
        />
      </DrawerShell>

      {/* Wishlist drawer */}
      <DrawerShell open={drawer === "wishlist"} onClose={() => setDrawer(null)} title="Wishlist">
        {wishProducts.length === 0 ? (
          <EmptyState icon={<Heart size={26} />} text="No saved devices yet." />
        ) : (
          <div className="space-y-3">
            {wishProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-zinc-800">
                <img src={p.image} alt={p.name} className="h-14 w-14 rounded-xl bg-slate-100 object-cover dark:bg-zinc-900" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">{p.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">${p.basePrice.toLocaleString()}</p>
                </div>
                <button onClick={() => { quickAdd(p); }} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
                  Add
                </button>
                <button onClick={() => toggleWishlist(p.id)} aria-label="Remove" className="text-slate-400 hover:text-rose-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </DrawerShell>

      {/* Compare drawer */}
      <DrawerShell open={drawer === "compare"} onClose={() => setDrawer(null)} title="Compare" wide>
        {compareProducts.length === 0 ? (
          <EmptyState icon={<Scale size={26} />} text="Pick up to 3 devices to compare." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-28" />
                  {compareProducts.map((p) => (
                    <th key={p.id} className="p-2 text-left align-top">
                      <img src={p.image} alt={p.name} className="mb-2 h-20 w-full rounded-xl bg-slate-100 object-cover dark:bg-zinc-900" />
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{p.name}</p>
                      <button onClick={() => toggleCompare(p.id)} className="mt-1 text-[11px] text-rose-500">Remove</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompareRow label="Price" cells={compareProducts.map((p) => `$${p.basePrice.toLocaleString()}`)} />
                <CompareRow label="Brand" cells={compareProducts.map((p) => p.brand)} />
                <CompareRow label="Condition" cells={compareProducts.map((p) => p.condition)} />
                <CompareRow label="Rating" cells={compareProducts.map((p) => `★ ${p.rating}`)} />
                {["Chip", "Display", "Battery", "RAM", "Camera", "Weight"].map((spec) => (
                  <CompareRow
                    key={spec}
                    label={spec}
                    cells={compareProducts.map((p) => p.specs.find((s) => s.label === spec)?.value ?? "—")}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DrawerShell>

      {/* Orders drawer */}
      <DrawerShell open={drawer === "orders"} onClose={() => setDrawer(null)} title="Order history">
        {orders.length === 0 ? (
          <EmptyState icon={<History size={26} />} text="No orders yet. Your Chicago purchases appear here." />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{o.id}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    ${o.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{o.placedAt}</p>
                <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
                  {o.lines.reduce((s, l) => s + l.quantity, 0)} items · {o.delivery}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {o.lines.map((l) => l.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </DrawerShell>

      {/* Compare floating bar */}
      <AnimatePresence>
        {compare.length > 0 && drawer !== "compare" && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setDrawer("compare")}
            className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl dark:bg-white dark:text-zinc-900"
          >
            <Scale size={16} /> Compare {compare.length} device{compare.length > 1 ? "s" : ""}
            <ArrowRight size={15} />
          </motion.button>
        )}
      </AnimatePresence>

      <ProductDetailModal
        product={selected}
        onClose={() => setSelected(null)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        wishlisted={selected ? wishlist.includes(selected.id) : false}
      />

      <CartAndCheckoutModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onQty={setQty}
        onRemove={removeItem}
        onClear={() => setCart([])}
        onCheckoutComplete={(o) => {
          setOrders((prev) => {
            const next = [o, ...prev].slice(0, 20);
            localStorage.setItem(LS.orders, JSON.stringify(next));
            return next;
          });
        }}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-zinc-900"
          >
            <Star size={14} className="fill-emerald-400 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Filter panel ============ */
function FilterPanel({
  brands,
  setBrands,
  condition,
  setCondition,
  maxPrice,
  setMaxPrice,
  onReset,
}: {
  brands: Brand[];
  setBrands: (b: Brand[]) => void;
  condition: Condition | "All";
  setCondition: (c: Condition | "All") => void;
  maxPrice: number;
  setMaxPrice: (n: number) => void;
  onReset: () => void;
}) {
  const toggleBrand = (b: Brand) =>
    setBrands(brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-zinc-100">
          <SlidersHorizontal size={15} /> Filters
        </h3>
        <button onClick={onReset} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-zinc-400">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Brand</p>
        <div className="space-y-1.5">
          {BRANDS.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-zinc-300">
              <span
                className={
                  "grid h-4 w-4 place-items-center rounded border transition " +
                  (brands.includes(b) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 dark:border-zinc-600")
                }
              >
                {brands.includes(b) && <Check />}
              </span>
              <input type="checkbox" className="sr-only" checked={brands.includes(b)} onChange={() => toggleBrand(b)} />
              {b}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Condition</p>
        <div className="flex flex-wrap gap-1.5">
          {(["All", ...CONDITIONS] as (Condition | "All")[]).map((c) => (
            <button
              key={c}
              onClick={() => setCondition(c)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition " +
                (condition === c
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-zinc-700 dark:text-zinc-300")
              }
            >
              {c === "Certified Refurbished" ? "Refurbished" : c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
          Max price: <span className="text-slate-900 dark:text-zinc-100">${maxPrice.toLocaleString()}</span>
        </p>
        <input
          type="range"
          min={200}
          max={PRICE_CEILING}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>$200</span>
          <span>${PRICE_CEILING.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ============ Drawer shell ============ */
function DrawerShell({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={"relative z-10 flex h-full w-full flex-col bg-white shadow-2xl dark:bg-zinc-950 " + (wide ? "max-w-2xl" : "max-w-md")}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-50">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-800">{icon}</div>
      <p className="mt-4 max-w-[28ch] text-sm text-slate-500 dark:text-zinc-400">{text}</p>
    </div>
  );
}

function CompareRow({ label, cells }: { label: string; cells: string[] }) {
  return (
    <tr className="border-t border-slate-100 dark:border-zinc-800">
      <td className="py-2 pr-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="p-2 text-sm text-slate-700 dark:text-zinc-200">{c}</td>
      ))}
    </tr>
  );
}

/* ============ Footer ============ */
function Footer({ onOrders }: { onOrders: () => void }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white">
              <Building2 size={18} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-50">Chicago Gadgets</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
            Windy City&apos;s premium source for iPhones, MacBooks, smartwatches and Android flagships. Certified, warrantied, delivered fast.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-zinc-300">
            <li><a href="#catalog" className="hover:text-blue-600">iPhones</a></li>
            <li><a href="#catalog" className="hover:text-blue-600">MacBooks</a></li>
            <li><a href="#catalog" className="hover:text-blue-600">Smartwatches</a></li>
            <li><a href="#catalog" className="hover:text-blue-600">Android</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-zinc-300">
            <li><button onClick={onOrders} className="hover:text-blue-600">Order history</button></li>
            <li><a href="#top" className="hover:text-blue-600">Warranty</a></li>
            <li><a href="#top" className="hover:text-blue-600">Trade-in</a></li>
            <li><span className="text-slate-500">The Loop, Chicago IL</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-400 dark:border-zinc-800">
        © {new Date().getFullYear()} Chicago Gadgets. Simulated storefront — no real transactions.
      </div>
    </footer>
  );
}
