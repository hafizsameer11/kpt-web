import feed1 from "@/assets/art-feed-1.jpg";
import feed2 from "@/assets/art-feed-2.jpg";
import feed3 from "@/assets/art-feed-3.jpg";
import emptyState from "@/assets/art-empty-state.jpg";
import productVault from "@/assets/art-product-vault.jpg";
import productLock from "@/assets/art-product-lock.jpg";
import productTarget from "@/assets/art-product-target.jpg";
import productFlex from "@/assets/art-product-flex.jpg";

/** Abstract brand artwork (navy / gold) used across the Kipit screens. */
export const FEED_ART = [feed1, feed2, feed3];

export const EMPTY_STATE_ART = emptyState;

export const PRODUCT_ART: Record<string, string> = {
  "Kipit Vault": productVault,
  "Kipit Lock": productLock,
  "Target Savings": productTarget,
  "Flex Wallet": productFlex,
};

export const feedArt = (index: number) => FEED_ART[index % FEED_ART.length];

export const productArt = (name: string) => PRODUCT_ART[name] ?? productVault;

import learnSameDay from "@/assets/learn-same-day-settlement.jpg";
import learnTenor from "@/assets/learn-tenor-and-yield.jpg";
import learnTier2 from "@/assets/learn-instant-tier-2.jpg";
import learnCall from "@/assets/learn-call-account.jpg";
import learnLadder from "@/assets/learn-building-a-ladder.jpg";
import learnGifting from "@/assets/learn-gifting-investments.jpg";

/** Photographic cover art for Learn articles, keyed by article id. */
export const LEARN_ART: Record<string, string> = {
  "same-day-settlement": learnSameDay,
  "tenor-and-yield": learnTenor,
  "instant-tier-2": learnTier2,
  "call-account-explained": learnCall,
  "building-a-ladder": learnLadder,
  "gifting-investments": learnGifting,
};

export const articleArt = (id: string, index = 0) =>
  LEARN_ART[id] ?? feedArt(index);
