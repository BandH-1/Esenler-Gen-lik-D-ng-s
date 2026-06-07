# Gençlik Döngüsü — Build Plan (Prompt 1)

A mobile-first municipal youth circular exchange module for Esenler Municipality, built as a self-contained TanStack Start app with mock data (no backend yet). Turkish UI throughout.

## Scope of this prompt
Foundation only: design system, routing shell, all main pages with mock data, data models as TypeScript types, navigation, and an admin panel view. No auth, no real backend, no QR scanning logic yet — those come in later prompts. QR codes render as placeholders.

## Design direction
- Mobile-first, card-based, rounded (xl radii), generous spacing
- Soft neutral background (warm off-white), green + blue accents
  - `--primary` deep municipal blue
  - `--accent` sustainability green
  - `--secondary` soft neutral
- Typography: Inter/DM Sans pair, clear hierarchy
- Trust-forward, professional, not childish
- All tokens defined in `src/styles.css` via `@theme inline` (oklch)
- Bottom tab bar on mobile, sidebar on desktop

## Routes (TanStack file-based)
```text
src/routes/
  __root.tsx                 root shell + providers + layout chrome
  index.tsx                  Home / landing
  ilanlar.tsx                Browse items + filters
  ilanlar.$itemId.tsx        Item detail
  esya-ekle.tsx              Add item form (mock submit)
  taleplerim.tsx             My Requests (tabs: pending/approved/QR/done/cancelled)
  ilanlarim.tsx              My Listings
  teslim-noktalari.tsx       Safe handover points
  puanlarim.tsx              Eko-Puan wallet
  profil.tsx                 User profile + eligibility info
  yonetim.tsx                Municipality admin dashboard
```

Bottom nav (mobile): Home, İlanlar, Eşya Ekle (center FAB), Taleplerim, Profil.
Top header: app title, points badge, link to handover points. Admin panel linked from profile.

## Mock data layer
`src/lib/mock/` with typed fixtures and a tiny in-memory store (Zustand) so listings/requests update during a session:
- `types.ts` — User, Item, Request, HandoverPoint, PointTransaction, Report, plus status enums exactly as specified
- `users.ts` — current user + a few others (verified Esenler youth)
- `items.ts` — ~18 items spanning all 6 categories with realistic Turkish titles
- `handoverPoints.ts` — 5–6 municipal points (gençlik merkezi, kütüphane, kültür merkezi, hizmet binası) in Esenler mahalleleri
- `requests.ts`, `pointTransactions.ts`, `reports.ts`
- `store.ts` — Zustand store exposing items/requests/points with actions: addItem, requestItem, approveRequest, completeHandover (awards Eko-Puan), cancelRequest, reportItem

## Page contents (all Turkish UI)

**Home** — Hero with title + subtitle, 4 quick-action buttons, 4 impact stat cards (computed from mock data), 6 category cards with icons, "Öne çıkan ilanlar" carousel, safety reminder strip.

**Browse (İlanlar)** — Filter bar (kategori, durum, mahalle, okul seviyesi, teslim noktası, sıralama). Responsive card grid. Each card: image, başlık, kategori chip, durum, mahalle, teslim noktası, Eko-Puan rozet, status badge.

**Item Detail** — Image gallery, başlık, açıklama, kategori, durum, kategoriye özel attribute satırı (sınıf/beden/ders), verici trust badge, teslim noktası kartı, müsaitlik, "Talep Et" CTA (opens confirm modal that creates a Request via store), "İlanı bildir" link, sabit güvenlik notu.

**Add Item (Eşya Ekle)** — Multi-section form with photo placeholder upload, başlık, kategori select, açıklama, durum, mahalle, teslim noktası, kategoriye-göre dinamik alanlar, zorunlu onay checkbox. Submit pushes to store and routes to My Listings with "Onay bekliyor" status.

**My Requests (Taleplerim)** — Tabs: Bekleyen / Onaylı / QR Hazır / Tamamlanan / İptal. QR Ready tab shows a placeholder QR (SVG) per request with a "Tamamlandı olarak işaretle" demo button.

**My Listings (İlanlarım)** — Listing cards grouped by status with quick actions (kaldır, talep gör).

**Eko-Puan Wallet (Puanlarım)** — Big balance card, "Bu sezon kazanılan", history list of PointTransaction, açıklama bloğu, Esenlink bağlantısı placeholder.

**Safe Handover Points (Teslim Noktaları)** — List of HandoverPoint cards (ad, adres, açılış saatleri, tip, QR onay rozeti). Map placeholder (styled box, real map later).

**Profile (Profil)** — User card with trust score, eligibility checklist (user type, age, school, neighborhood, verification), link to admin panel if role=admin, settings placeholders.

**Admin (Yönetim)** — Dashboard with metric cards (toplam ilan, tamamlanan takas, bekleyen şikayet, dağıtılan Eko-Puan, tahmini önlenen atık kg), category breakdown bar chart (Recharts), active neighborhoods list, moderation queue table (items awaiting review with approve/reject), handover point activity table.

## Components
`src/components/`
- `layout/AppShell.tsx` — header + bottom-nav + content
- `layout/BottomNav.tsx`, `layout/Header.tsx`
- `items/ItemCard.tsx`, `items/CategoryIcon.tsx`, `items/StatusBadge.tsx`, `items/EcoPointsBadge.tsx`
- `items/FilterBar.tsx`
- `handover/HandoverPointCard.tsx`, `handover/QrPlaceholder.tsx`
- `common/ImpactStat.tsx`, `common/SafetyNote.tsx`, `common/EmptyState.tsx`
- `admin/MetricCard.tsx`, `admin/CategoryChart.tsx`, `admin/ModerationRow.tsx`

Use shadcn primitives (Card, Button, Badge, Tabs, Select, Dialog, Input, Textarea, Checkbox) already in the project.

## Critical UX rules surfaced in UI
- Persistent "Ücretsiz • Güvenli Teslim Noktası • QR Onayı" strip on item detail and request flow
- "Adres paylaşma" warning in add-item form
- Points note: "Puanlar yalnızca QR onaylı teslimden sonra eklenir"

## Out of scope (later prompts)
- Real auth / Esenlink SSO
- Real QR scanning + camera flow
- Real-time messaging
- Backend persistence (Lovable Cloud)
- Real maps
- Real photo uploads

## Deliverable
A fully clickable mock app: browse → request → admin approves → QR ready → mark complete → points credited, all in-memory and resetting on refresh.

Ready to switch to build mode and implement?