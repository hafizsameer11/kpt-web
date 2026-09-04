/**
 * Live wallet balance for the prototype.
 * Persists to localStorage so deposits and withdrawals actually move the balance.
 */
import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "kipit:wallet-balance";
const LEDGER_KEY = "kipit:wallet-ledger";
export const STARTING_WALLET = 500_000;

let current = STARTING_WALLET;
let hydrated = false;
const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== "undefined";

function hydrate() {
  if (hydrated || !isBrowser()) return;
  hydrated = true;
  const raw = window.localStorage.getItem(KEY);
  const parsed = raw === null ? NaN : Number(raw);
  if (Number.isFinite(parsed) && parsed >= 0) current = parsed;
}

function persist() {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, String(current));
}

function emit() {
  listeners.forEach((l) => l());
}

/** Current wallet balance (hydrates from storage on first browser read). */
export function getWalletBalance() {
  hydrate();
  return current;
}

export function setWalletBalance(next: number) {
  hydrate();
  current = Math.max(0, Math.round(next));
  persist();
  emit();
  return current;
}

export function resetWalletBalance() {
  if (isBrowser()) window.localStorage.removeItem(LEDGER_KEY);
  return setWalletBalance(STARTING_WALLET);
}

function ledger(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(LEDGER_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Applies a one-off movement. `ref` makes it idempotent so a success screen
 * refresh or re-visit does not double-count the same deposit/withdrawal.
 */
export function applyWalletMovement(ref: string, delta: number) {
  hydrate();
  if (!Number.isFinite(delta) || delta === 0) return current;
  const seen = ledger();
  if (seen.includes(ref)) return current;
  if (isBrowser()) {
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify([...seen.slice(-49), ref]));
  }
  return setWalletBalance(current + delta);
}

export const creditWallet = (ref: string, amount: number) =>
  applyWalletMovement(ref, Math.abs(amount));

export const debitWallet = (ref: string, amount: number) =>
  applyWalletMovement(ref, -Math.abs(amount));

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const subscribeWallet = (listener: (value: number) => void) =>
  subscribe(() => listener(current));

/** Reactive wallet balance for components (hydration safe). */
export function useWalletBalance() {
  const value = useSyncExternalStore(subscribe, getWalletBalance, () => STARTING_WALLET);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? value : STARTING_WALLET;
}
