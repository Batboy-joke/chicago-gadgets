import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Check,
  Download,
  Truck,
  Store,
  Tag,
} from "lucide-react";
import type { CartItem, DeliveryMethod, Order } from "../types";

const COUPON = { code: "WINDY10", rate: 0.1 };
const TAX_RATE = 0.1025;

interface Props {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onQty: (lineId: string, qty: number) => void;
  onRemove: (lineId: string) => void;
  onClear: () => void;
  onCheckoutComplete: (order: Order) => void;
}

type Step = "cart" | "checkout" | "success";

export default function CartAndCheckoutModal({
  open,
  onClose,
  items,
  onQty,
  onRemove,
  onClear,
  onCheckoutComplete,
}: Props) {
  const [step, setStep] = useState<Step>("cart");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    neighborhood: "Lincoln Park",
    card: "",
    expiry: "",
    cvc: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<Order | null>(null);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discount = couponApplied ? subtotal * COUPON.rate : 0;
  const shipping =
    delivery === "pickup" ? 0 : delivery === "express" ? 24 : subtotal - discount > 999 ? 0 : 12;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * TAX_RATE;
  const total = taxable + tax + shipping;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === COUPON.code) {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponApplied(false);
      setCouponError("Invalid code. Try WINDY10.");
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Valid phone required";
    if (delivery !== "pickup" && !form.address.trim()) e.address = "Address required";
    if (form.card.replace(/\s/g, "").length < 15) e.card = "Valid card required";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = "MM/YY";
    if (form.cvc.length < 3) e.cvc = "CVC";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = () => {
    if (!validate()) return;
    const o: Order = {
      id: "CG-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      lines: items.map((i) => ({
        name: i.product.name,
        storage: i.storage.label,
        color: i.color.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal,
      discount,
      tax,
      shipping,
      total,
      customerName: form.name,
      neighborhood: form.neighborhood,
      delivery:
        delivery === "pickup"
          ? "Store pickup — The Loop"
          : delivery === "express"
            ? "Express (2 hrs)"
            : "Standard (same-day)",
      placedAt: new Date().toLocaleString("en-US"),
    };
    setOrder(o);
    setStep("success");
    onCheckoutComplete(o);
    onClear();
  };

  const downloadInvoice = () => {
    if (!order) return;
    const lines = order.lines
      .map(
        (l) =>
          `${l.quantity} x ${l.name} (${l.storage}, ${l.color}) — $${(
            l.unitPrice * l.quantity
          ).toLocaleString()}`,
      )
      .join(String.fromCharCode(10));
    const text =
      `CHICAGO GADGETS — INVOICE
Order ${order.id}
${order.placedAt}

` +
      `Customer: ${order.customerName} (${order.neighborhood})
Delivery: ${order.delivery}

` +
      `${lines}

Subtotal: $${order.subtotal.toLocaleString()}
` +
      `Discount: -$${order.discount.toLocaleString()}
Tax: $${order.tax.toFixed(2)}
` +
      `Shipping: $${order.shipping.toLocaleString()}
TOTAL: $${order.total.toLocaleString()}

` +
      `Thank you for shopping local.`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${order.id}-invoice.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const closeAll = () => {
    onClose();
    setTimeout(() => {
      setStep("cart");
      setCoupon("");
      setCouponApplied(false);
      setErrors({});
    }, 200);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeAll} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-zinc-50">
                {step === "cart" && (
                  <>
                    <ShoppingBag size={18} className="text-blue-600" /> Your Cart
                  </>
                )}
                {step === "checkout" && "Checkout"}
                {step === "success" && "Order Confirmed"}
              </h2>
              <button
                onClick={closeAll}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* CART STEP */}
            {step === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {items.length === 0 ? (
                    <EmptyCart onClose={closeAll} />
                  ) : (
                    <div className="space-y-3">
                      {items.map((i) => (
                        <div
                          key={i.lineId}
                          className="flex gap-3 rounded-2xl border border-slate-100 p-3 dark:border-zinc-800"
                        >
                          <img
                            src={i.product.image}
                            alt={i.product.name}
                            className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover dark:bg-zinc-900"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                              {i.product.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {i.storage.label} · {i.color.name}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-zinc-700">
                                <button
                                  onClick={() => onQty(i.lineId, i.quantity - 1)}
                                  className="grid h-7 w-7 place-items-center text-slate-600 dark:text-zinc-300"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                  {i.quantity}
                                </span>
                                <button
                                  onClick={() => onQty(i.lineId, Math.min(i.product.stock, i.quantity + 1))}
                                  className="grid h-7 w-7 place-items-center text-slate-600 dark:text-zinc-300"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                  ${(i.unitPrice * i.quantity).toLocaleString()}
                                </span>
                                <button
                                  onClick={() => onRemove(i.lineId)}
                                  aria-label="Remove"
                                  className="text-slate-400 hover:text-rose-500"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t border-slate-200 px-5 py-4 dark:border-zinc-800">
                    <div className="mb-3 flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          placeholder="Coupon: WINDY10"
                          className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <button
                        onClick={applyCoupon}
                        className="rounded-full bg-slate-900 px-4 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="mb-2 text-xs text-rose-500">{couponError}</p>}
                    {couponApplied && (
                      <p className="mb-2 text-xs font-medium text-emerald-600">
                        WINDY10 applied — 10% off.
                      </p>
                    )}
                    <SummaryRow label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
                    {discount > 0 && (
                      <SummaryRow label="Discount" value={`-$${discount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent />
                    )}
                    <button
                      onClick={() => setStep("checkout")}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99]"
                    >
                      Proceed to Checkout <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* CHECKOUT STEP */}
            {step === "checkout" && (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <button
                    onClick={() => setStep("cart")}
                    className="mb-3 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-zinc-400"
                  >
                    ← Back to cart
                  </button>

                  <Section title="Contact">
                    <Field label="Full name" error={errors.name}>
                      <input {...inputProps(form.name, (v) => set("name", v))} placeholder="Jordan Rivera" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Email" error={errors.email}>
                        <input {...inputProps(form.email, (v) => set("email", v))} placeholder="you@email.com" />
                      </Field>
                      <Field label="Phone" error={errors.phone}>
                        <input {...inputProps(form.phone, (v) => set("phone", v))} placeholder="312 555 0142" />
                      </Field>
                    </div>
                  </Section>

                  <Section title="Delivery">
                    <div className="grid grid-cols-3 gap-2">
                      <DeliveryOption active={delivery === "standard"} onClick={() => setDelivery("standard")} icon={<Truck size={16} />} label="Same-day" price="$0–12" />
                      <DeliveryOption active={delivery === "express"} onClick={() => setDelivery("express")} icon={<ArrowRight size={16} />} label="Express" price="$24" />
                      <DeliveryOption active={delivery === "pickup"} onClick={() => setDelivery("pickup")} icon={<Store size={16} />} label="Pickup" price="Free" />
                    </div>
                    {delivery !== "pickup" && (
                      <>
                        <Field label="Street address" error={errors.address}>
                          <input {...inputProps(form.address, (v) => set("address", v))} placeholder="1234 W Division St" />
                        </Field>
                        <Field label="Chicago neighborhood">
                          <select
                            value={form.neighborhood}
                            onChange={(e) => set("neighborhood", e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          >
                            {["Lincoln Park", "Wicker Park", "The Loop", "River North", "Lakeview", "Hyde Park", "Logan Square", "Streeterville"].map((n) => (
                              <option key={n}>{n}</option>
                            ))}
                          </select>
                        </Field>
                      </>
                    )}
                  </Section>

                  <Section title="Payment">
                    <Field label="Card number" error={errors.card}>
                      <div className="relative">
                        <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input {...inputProps(form.card, (v) => set("card", v))} placeholder="4242 4242 4242 4242" className="pl-9" />
                      </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry" error={errors.expiry}>
                        <input {...inputProps(form.expiry, (v) => set("expiry", v))} placeholder="09/26" />
                      </Field>
                      <Field label="CVC" error={errors.cvc}>
                        <input {...inputProps(form.cvc, (v) => set("cvc", v))} placeholder="123" />
                      </Field>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <ShieldCheck size={12} /> Simulated payment — no real charge is made.
                    </p>
                  </Section>
                </div>

                <div className="border-t border-slate-200 px-5 py-4 dark:border-zinc-800">
                  <SummaryRow label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
                  {discount > 0 && <SummaryRow label="Discount" value={`-$${discount.toFixed(0)}`} accent />}
                  <SummaryRow label="Tax (10.25%)" value={`$${tax.toFixed(2)}`} />
                  <SummaryRow label="Shipping" value={shipping === 0 ? "Free" : `$${shipping}`} />
                  <div className="my-2 h-px bg-slate-200 dark:bg-zinc-800" />
                  <SummaryRow label="Total" value={`$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} bold />
                  <button
                    onClick={placeOrder}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99]"
                  >
                    <Lock /> Place Order · ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </button>
                </div>
              </>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && order && (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                >
                  <Check size={30} strokeWidth={3} />
                </motion.div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-zinc-50">
                  Thanks, {order.customerName.split(" ")[0]}!
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  Order <span className="font-semibold text-blue-600">{order.id}</span> confirmed.
                </p>
                <div className="mt-5 w-full rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-300">
                    <span>Delivery</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">{order.delivery}</span>
                  </div>
                  <div className="mt-1.5 flex justify-between text-slate-600 dark:text-zinc-300">
                    <span>To</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">{order.neighborhood}, Chicago</span>
                  </div>
                  <div className="my-2.5 h-px bg-slate-200 dark:bg-zinc-800" />
                  <div className="flex justify-between text-slate-600 dark:text-zinc-300">
                    <span>Items</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">{order.lines.reduce((s, l) => s + l.quantity, 0)}</span>
                  </div>
                  <div className="mt-1.5 flex justify-between">
                    <span className="text-slate-600 dark:text-zinc-300">Total paid</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-50">
                      ${order.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex w-full gap-2">
                  <button
                    onClick={downloadInvoice}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 py-2.5 text-sm font-medium text-slate-800 hover:border-blue-400 dark:border-zinc-700 dark:text-zinc-100"
                  >
                    <Download size={15} /> Invoice
                  </button>
                  <button
                    onClick={closeAll}
                    className="flex-1 rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function inputProps(value: string, onChange: (v: string) => void) {
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    className:
      "h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
  };
}

function Lock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-800">
        <ShoppingBag size={28} />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-700 dark:text-zinc-200">Your cart is empty</p>
      <p className="mt-1 text-xs text-slate-400">Add a device to get started.</p>
      <button
        onClick={onClose}
        className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Browse catalog
      </button>
    </div>
  );
}

function SummaryRow({ label, value, accent, bold }: { label: string; value: string; accent?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className={bold ? "font-semibold text-slate-900 dark:text-zinc-50" : "text-slate-500 dark:text-zinc-400"}>
        {label}
      </span>
      <span
        className={
          (bold ? "text-base font-semibold text-slate-900 dark:text-zinc-50" : "font-medium text-slate-800 dark:text-zinc-200") +
          (accent ? " text-emerald-600 dark:text-emerald-400" : "")
        }
      >
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-zinc-300">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[11px] text-rose-500">{error}</span>}
    </label>
  );
}

function DeliveryOption({ active, onClick, icon, label, price }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; price: string }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition " +
        (active
          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-zinc-700 dark:text-zinc-300")
      }
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[10px] opacity-70">{price}</span>
    </button>
  );
}