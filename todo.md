# Crypto News Impact Radar - TODO

## Phase 1: Database Schema & Backend Foundation
- [x] Define DB schema: news, coin_impacts, user_coins tables
- [x] Generate and apply DB migrations
- [x] Add DB query helpers in server/db.ts
- [x] Add tRPC routers: news, coins

## Phase 2: News Fetching & AI Analysis Backend
- [x] Implement news fetching from external sources (CoinDesk, CryptoPanic, Cointelegraph, Bitcoin Magazine RSS)
- [x] Implement AI analysis per news item (bullish/bearish + impact level) via LLM
- [x] Implement scheduled news fetch (heartbeat /api/scheduled/fetch-news)
- [x] Implement manual refresh tRPC procedure

## Phase 3: Frontend Design System & News List
- [x] Design global theme (dark elegant, gold accent, OKLCH color system)
- [x] Update index.css with custom color palette & typography (Inter + Playfair Display + JetBrains Mono)
- [x] Build main layout with top navigation (TopNav)
- [x] Build news list page with cards (title, summary, source, time, coins, 利多/利空 badge)
- [x] Build filter bar (by coin, by 利多/利空)
- [x] Build coin selector / watchlist UI (FilterBar)

## Phase 4: News Detail Page & Coin Management
- [x] Build news detail page with full AI analysis report (NewsDetail.tsx)
- [x] Build coin management modal (add/remove coins, presets BTC/ETH/SOL etc.) (CoinManager.tsx)
- [x] Manual refresh button with loading state (TopNav)
- [x] Empty state and loading skeletons (NewsCardSkeleton.tsx)

## Phase 5: Tests & Checkpoint
- [x] Write vitest tests for news router (news.test.ts - 7 tests)
- [x] Write vitest tests for AI analysis logic (mocked)
- [x] Final review and checkpoint
