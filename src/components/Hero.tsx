import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Truck, Zap, ShieldCheck } from "lucide-react";
import { HERO_IMAGE } from "../data/products";

interface HeroProps {
  onExplore: () => void;
  onDeals: () => void;
}

const TICKER = [
  "Free same-day delivery inside Chicago",
  "Certified 128-point device inspection",
  "2-year Chicago-backed warranty",
  "0% financing available",
  "Trade-in credit up to $700",
  "In-store pickup at The Loop flagship",
];

export default function Hero({ onExplore, onDeals }: HeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-blue-950/40"
    >
      {/* aurora blobs */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/20" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-700/10" />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-20 lg:px-8">
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-3 py-1 text-xs font-semibold text-blue-700 backdrop-blur dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <Zap size={13} className="fill-blue-500 text-blue-500" />
            iPhone 16 Pro Titanium now in stock
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tighter text-slate-900 sm:text-5xl lg:text-6xl dark:text-zinc-50"
          >
            Premium tech,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              delivered Windy City fast.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-[46ch] text-base leading-relaxed text-slate-600 dark:text-zinc-400"
          >
            Shop flagship iPhones, MacBooks, smartwatches and Android phones.
            Verified specs, honest conditions, Chicago-grade service.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={onExplore}
              className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-700 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Explore Collection
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </button>
            <button
              onClick={onDeals}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/60 px-6 py-3 text-sm font-semibold text-slate-800 backdrop-blur transition hover:border-blue-400 hover:text-blue-700 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-blue-500"
            >
              Today&apos;s Chicago Deals
            </button>
          </motion.div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              2-year warranty
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Certified devices
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck size={16} className="text-blue-600 dark:text-blue-400" />
              Same-day delivery
            </span>
          </div>
        </div>

        {/* Device visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 120, damping: 18 }}
          className="relative z-10"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/60 shadow-2xl shadow-blue-900/10 dark:border-zinc-800">
            <img
              src={HERO_IMAGE}
              alt="Flagship iPhone and MacBook on cobalt gradient"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Zap size={18} />
            </span>
            <div className="leading-tight">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Featured flagship
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
                iPhone 16 Pro Max
              </p>
            </div>
            <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Save $200
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Ticker marquee */}
      <div className="relative border-y border-slate-200 bg-white/60 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 whitespace-nowrap px-4">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-zinc-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
