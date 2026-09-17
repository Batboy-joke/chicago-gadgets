import { motion } from "framer-motion";
import { Star, Heart, Plus, Scale, ShoppingCart } from "lucide-react";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onOpen: (p: Product) => void;
  onAdd: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlisted: boolean;
  onToggleCompare: (id: string) => void;
  comparing: boolean;
  index: number;
}

export default function ProductCard({
  product,
  onOpen,
  onAdd,
  onToggleWishlist,
  wishlisted,
  onToggleCompare,
  comparing,
  index,
}: ProductCardProps) {
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.basePrice) / product.compareAtPrice) *
          100,
      )
    : 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
    >
      {/* Image */}
      <button
        onClick={() => onOpen(product)}
        className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 dark:from-zinc-800 dark:to-zinc-900"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            -{discount}%
          </span>
        )}
        <span className="absolute right-3 top-3">
          <ConditionBadge condition={product.condition} />
        </span>
      </button>

      {/* Wishlist + compare */}
      <div className="absolute right-3 top-[calc(50%-1.5rem)] flex flex-col gap-2 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={() => onToggleWishlist(product.id)}
          aria-label="Wishlist"
          className={
            "grid h-9 w-9 place-items-center rounded-full border shadow-sm backdrop-blur transition " +
            (wishlisted
              ? "border-rose-200 bg-rose-500 text-white"
              : "border-slate-200 bg-white/90 text-slate-600 hover:text-rose-500 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300")
          }
        >
          <Heart size={16} className={wishlisted ? "fill-current" : ""} />
        </button>
        <button
          onClick={() => onToggleCompare(product.id)}
          aria-label="Compare"
          className={
            "grid h-9 w-9 place-items-center rounded-full border shadow-sm backdrop-blur transition " +
            (comparing
              ? "border-blue-200 bg-blue-600 text-white"
              : "border-slate-200 bg-white/90 text-slate-600 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300")
          }
        >
          <Scale size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
          <span>{product.brand}</span>
          <span>·</span>
          <span>{product.category}</span>
        </div>
        <button
          onClick={() => onOpen(product)}
          className="mt-1 text-left text-[15px] font-semibold leading-snug text-slate-900 hover:text-blue-700 dark:text-zinc-50 dark:hover:text-blue-400"
        >
          {product.name}
        </button>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-zinc-400">
          {product.tagline}
        </p>

        {/* Quick spec pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.specs.slice(0, 2).map((s) => (
            <span
              key={s.label}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {s.value}
            </span>
          ))}
        </div>

        {/* Colors */}
        <div className="mt-3 flex items-center gap-1.5">
          {product.colors.slice(0, 4).map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="h-4 w-4 rounded-full border border-black/10 shadow-inner dark:border-white/20"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {product.rating}
          </span>
        </div>

        {/* Price + add */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              ${product.basePrice.toLocaleString()}
            </p>
            {product.compareAtPrice && (
              <p className="text-xs text-slate-400 line-through dark:text-zinc-500">
                ${product.compareAtPrice.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={() => onAdd(product)}
            aria-label="Add to cart"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-600 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-blue-500 dark:hover:text-white"
          >
            <Plus size={14} className="sm:hidden" />
            <ShoppingCart size={14} className="hidden sm:block" />
            Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function ConditionBadge({
  condition,
}: {
  condition: Product["condition"];
}) {
  const map: Record<Product["condition"], string> = {
    "Brand New": "bg-emerald-500/90 text-white",
    "Certified Refurbished": "bg-blue-500/90 text-white",
    "Open Box": "bg-amber-500/90 text-white",
  };
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur " +
        map[condition]
      }
    >
      {condition}
    </span>
  );
}
