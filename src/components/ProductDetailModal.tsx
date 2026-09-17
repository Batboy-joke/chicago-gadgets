import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
  Package,
  Check,
  Heart,
  Truck,
} from "lucide-react";
import type { Product, CartItem } from "../types";
import { ConditionBadge } from "./ProductCard";

interface Props {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onToggleWishlist: (id: string) => void;
  wishlisted: boolean;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  wishlisted,
}: Props) {
  const [storageIdx, setStorageIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (product) {
      setStorageIdx(0);
      setColorIdx(0);
      setQty(1);
      setActiveImg(0);
    }
  }, [product]);

  const price = useMemo(() => {
    if (!product) return 0;
    return product.basePrice + (product.storage[storageIdx]?.priceDelta ?? 0);
  }, [product, storageIdx]);

  if (!product) return null;

  const storage = product.storage[storageIdx];
  const color = product.colors[colorIdx];

  const handleAdd = () => {
    const lineId = `${product.id}::${storage.label}::${color.name}`;
    const item: CartItem = {
      lineId,
      product,
      storage,
      color,
      quantity: qty,
      unitPrice: price,
    };
    onAddToCart(item);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:bg-zinc-950"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-slate-600 shadow backdrop-blur transition hover:bg-white dark:bg-zinc-800/80 dark:text-zinc-300"
          >
            <X size={18} />
          </button>

          <div className="grid gap-0 md:grid-cols-2">
            {/* Gallery */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-6 dark:from-zinc-900 dark:to-zinc-950">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white/60 dark:bg-zinc-900/60">
                <img
                  src={product.gallery[activeImg] ?? product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {product.gallery.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {product.gallery.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={
                        "h-16 w-16 overflow-hidden rounded-xl border-2 transition " +
                        (activeImg === i
                          ? "border-blue-500"
                          : "border-transparent opacity-70 hover:opacity-100")
                      }
                    >
                      <img src={g} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {product.warrantyTags.map((w) => (
                  <span
                    key={w}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                  >
                    <ShieldCheck size={12} />
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 md:py-8 md:pr-8">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                <span>{product.brand}</span>
                <span>·</span>
                <span>{product.category}</span>
                <ConditionBadge condition={product.condition} />
              </div>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                {product.tagline}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-zinc-200">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  {product.rating}
                </span>
                <span className="text-slate-400 dark:text-zinc-500">
                  ({product.reviews.toLocaleString()} reviews)
                </span>
                <span className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {product.stock} in stock
                </span>
              </div>

              {/* Color */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                  Color: <span className="text-slate-900 dark:text-zinc-100">{color.name}</span>
                </p>
                <div className="mt-2 flex gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => setColorIdx(i)}
                      aria-label={c.name}
                      className={
                        "grid h-8 w-8 place-items-center rounded-full border-2 transition " +
                        (colorIdx === i
                          ? "border-blue-500"
                          : "border-transparent hover:border-slate-300")
                      }
                    >
                      <span
                        className="h-6 w-6 rounded-full border border-black/10 dark:border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                  Capacity
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.storage.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setStorageIdx(i)}
                      className={
                        "rounded-xl border px-3.5 py-2 text-sm font-medium transition " +
                        (storageIdx === i
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-zinc-700 dark:text-zinc-300")
                      }
                    >
                      {s.label}
                      {s.priceDelta > 0 && (
                        <span className="ml-1 text-[11px] text-slate-400">
                          +${s.priceDelta}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price + qty */}
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                    ${price.toLocaleString()}
                  </p>
                  {product.compareAtPrice && (
                    <p className="text-sm text-slate-400 line-through">
                      ${product.compareAtPrice.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-slate-200 p-1 dark:border-zinc-700">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-zinc-50">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleAdd}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <ShoppingCart size={17} />
                  Add to Cart
                </button>
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Wishlist"
                  className={
                    "grid h-12 w-12 place-items-center rounded-full border transition active:scale-95 " +
                    (wishlisted
                      ? "border-rose-200 bg-rose-500 text-white"
                      : "border-slate-200 text-slate-600 hover:text-rose-500 dark:border-zinc-700 dark:text-zinc-300")
                  }
                >
                  <Heart size={18} className={wishlisted ? "fill-current" : ""} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <Truck size={14} />
                Free same-day delivery in Chicago on this item
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="border-t border-slate-100 p-6 md:px-8 dark:border-zinc-800">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              Technical Specifications
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {product.specs.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  <Check size={15} className="text-blue-600" />
                  Highlights
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {product.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-400"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  <Package size={15} className="text-blue-600" />
                  In the Box
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {product.inBox.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-400"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
