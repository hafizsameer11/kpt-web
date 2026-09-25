/**
 * Live wallet balance from kipit-api. Defaults to 0 — never seed demo money.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { fetchWallet, isAuthenticated, sandboxDeposit } from "@/lib/api";

const KEY = "kipit:wallet-balance";
const LEDGER_KEY = "kipit:wallet-ledger";
export const STARTING_WALLET = 0;

let current = STARTING_WALLET;
let hydrated = false;
let syncing = false;
const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== "undefined";

function hydrate() {
  if (hydrated || !isBrowser()) return;
  hydrated = true;
  if (isAuthenticated()) {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw === null ? NaN : Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) current = parsed;
    void refreshWalletFromApi();
  } else {
    current = 0;
  }
}

/** Pull latest balance from API (no-op if logged out). */
export async function refreshWalletFromApi() {
  if (!isBrowser() || !isAuthenticated() || syncing) return current;
  syncing = true;
  try {
    const wallet = await fetchWallet();
    current = Math.max(0, Math.round(wallet.balance));
    persist();
    emit();
  } catch {
    // Keep local cache if API is unreachable.
  } finally {
    syncing = false;
  }
  return current;
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
  if (isBrowser()) {
    window.localStorage.removeItem(LEDGER_KEY);
    window.localStorage.removeItem(KEY);
  }
  hydrated = true;
  current = 0;
  emit();
  return current;
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
 * When authenticated, deposits go through the sandbox funding API.
 */
export function applyWalletMovement(ref: string, delta: number) {
  hydrate();
  if (!Number.isFinite(delta) || delta === 0) return current;
  const seen = ledger();
  if (seen.includes(ref)) return current;
  if (isBrowser()) {
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify([...seen.slice(-49), ref]));
  }
  if (isAuthenticated() && delta > 0) {
    void sandboxDeposit(Math.abs(delta), ref)
      .then((res) => setWalletBalance(res.wallet.balance))
      .catch(() => setWalletBalance(current + delta));
    return current + Math.abs(delta);
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
  const value = useSyncExternalStore(subscribe, getWalletBalance, () => 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? value : 0;
}
