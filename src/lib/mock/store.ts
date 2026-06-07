import { create } from "zustand";
import {
  comments as initialComments,
  CURRENT_USER_ID,
  handoverPoints,
  items as initialItems,
  moderationEvents as initialModeration,
  pointTransactions as initialPT,
  reports as initialReports,
  requests as initialRequests,
  users,
} from "./fixtures";
import {
  calculateEcoPoints,
  type Comment,
  type ExchangeRequest,
  type Item,
  type ModerationEvent,
  type PointTransaction,
  type Report,
  type User,
} from "./types";
import { moderateComment, type ViolationType } from "@/lib/moderation";

/** Blocked community actions allowed before an automatic ban. */
export const STRIKE_LIMIT = 3;

export interface CommentResult {
  status: "published" | "blocked" | "banned" | "error";
  message: string;
  violations?: ViolationType[];
  strikes?: number;
}

interface StoreState {
  users: User[];
  items: Item[];
  requests: ExchangeRequest[];
  pointTransactions: PointTransaction[];
  reports: Report[];
  comments: Comment[];
  moderationEvents: ModerationEvent[];
  handoverPoints: typeof handoverPoints;
  currentUserId: string;
  demoMode: boolean;

  setCurrentUser: (id: string) => void;
  setDemoMode: (on: boolean) => void;

  // Community / moderation
  addComment: (itemId: string, text: string) => CommentResult;
  banUser: (userId: string, reason: string) => void;
  unbanUser: (userId: string) => void;

  addItem: (
    input: Omit<Item, "id" | "createdAt" | "status" | "ownerId" | "ecoPointReward"> & {
      ecoPointReward?: number;
    },
  ) => string;
  requestItem: (itemId: string) => string | null;
  approveRequest: (requestId: string) => void;
  markQrReady: (requestId: string) => void;
  completeRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  removeItem: (itemId: string) => void;
  approveItem: (itemId: string) => void;
  rejectItem: (itemId: string) => void;
  reportItem: (itemId: string, reason: string) => void;
  updateItemImage: (itemId: string, emoji: string) => void;

  // Eko-Puan admin operations
  retrySyncTx: (txId: string) => void;
  freezeTx: (txId: string) => void;
  reverseTx: (txId: string) => void;
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export const useStore = create<StoreState>((set, get) => ({
  users,
  items: initialItems,
  requests: initialRequests,
  pointTransactions: initialPT,
  reports: initialReports,
  comments: initialComments,
  moderationEvents: initialModeration,
  handoverPoints,
  currentUserId: CURRENT_USER_ID,
  demoMode: false,

  setCurrentUser: (id) => set({ currentUserId: id }),
  setDemoMode: (on) => set({ demoMode: on }),

  addComment: (itemId, rawText) => {
    const state = get();
    const user = state.users.find((u) => u.id === state.currentUserId);
    if (!user) return { status: "error", message: "Kullanıcı bulunamadı." };
    if (user.banned)
      return {
        status: "banned",
        message:
          "Hesabın topluluk kurallarını ihlal nedeniyle askıya alındı. Yorum yapamazsın.",
      };

    const text = rawText.trim();
    if (!text)
      return { status: "error", message: "Boş yorum gönderilemez." };

    const now = new Date().toISOString();
    const mod = moderateComment(text);

    if (!mod.ok) {
      const newStrikes = (user.strikes ?? 0) + 1;
      const willBan = newStrikes >= STRIKE_LIMIT;
      const banReason = `Topluluk kurallarının tekrarlı ihlali (${newStrikes}/${STRIKE_LIMIT})`;
      set((s) => ({
        comments: [
          {
            id: uid("c"),
            itemId,
            userId: user.id,
            text,
            status: "engellendi",
            violations: mod.violations,
            createdAt: now,
          },
          ...s.comments,
        ],
        users: s.users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                strikes: newStrikes,
                banned: willBan ? true : u.banned,
                banReason: willBan ? banReason : u.banReason,
                trustScore: Math.max(0, u.trustScore - 5),
              }
            : u,
        ),
        moderationEvents: [
          {
            id: uid("mod"),
            userId: user.id,
            itemId,
            type: willBan ? "ban" : "engellendi",
            violations: mod.violations,
            text,
            createdAt: now,
          },
          ...s.moderationEvents,
        ],
      }));
      return {
        status: willBan ? "banned" : "blocked",
        message: willBan
          ? "Tekrarlanan ihlaller nedeniyle hesabın otomatik olarak askıya alındı."
          : `${mod.message} Uyarı: ${newStrikes}/${STRIKE_LIMIT}.`,
        violations: mod.violations,
        strikes: newStrikes,
      };
    }

    set((s) => ({
      comments: [
        {
          id: uid("c"),
          itemId,
          userId: user.id,
          text,
          status: "yayinda",
          violations: [],
          createdAt: now,
        },
        ...s.comments,
      ],
    }));
    return { status: "published", message: "Yorumun yayınlandı." };
  },

  banUser: (userId, reason) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === userId ? { ...u, banned: true, banReason: reason } : u,
      ),
      moderationEvents: [
        {
          id: uid("mod"),
          userId,
          type: "ban",
          violations: [],
          text: reason,
          createdAt: new Date().toISOString(),
        },
        ...s.moderationEvents,
      ],
    })),

  unbanUser: (userId) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === userId
          ? { ...u, banned: false, banReason: undefined, strikes: 0 }
          : u,
      ),
      moderationEvents: [
        {
          id: uid("mod"),
          userId,
          type: "ban-kaldirildi",
          violations: [],
          createdAt: new Date().toISOString(),
        },
        ...s.moderationEvents,
      ],
    })),

  addItem: (input) => {
    const id = uid("i");
    const reward =
      input.ecoPointReward ?? calculateEcoPoints(input.category, input.condition);
    const item: Item = {
      ...input,
      id,
      ownerId: get().currentUserId,
      status: "incelemede",
      ecoPointReward: reward,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ items: [item, ...s.items] }));
    return id;
  },

  requestItem: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return null;
    const id = uid("r");
    const req: ExchangeRequest = {
      id,
      itemId,
      requesterId: get().currentUserId,
      ownerId: item.ownerId,
      status: "talep-edildi",
      qrCode: `GD-${id.toUpperCase()}`,
      handoverPointId: item.handoverPointId,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      requests: [req, ...s.requests],
      items: s.items.map((i) =>
        i.id === itemId ? { ...i, status: "rezerve" } : i,
      ),
    }));
    return id;
  },

  approveRequest: (requestId) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId ? { ...r, status: "onaylandi" } : r,
      ),
    })),

  markQrReady: (requestId) => {
    const req = get().requests.find((r) => r.id === requestId);
    const item = req && get().items.find((i) => i.id === req.itemId);
    if (!req || !item) return;
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId ? { ...r, status: "qr-hazir" } : r,
      ),
      items: s.items.map((i) =>
        i.id === req.itemId ? { ...i, status: "teslim-planlandi" } : i,
      ),
      // Reserve pending points for the giver
      pointTransactions: [
        {
          id: uid("pt"),
          userId: req.ownerId,
          itemId: item.id,
          points: item.ecoPointReward,
          reason: `${item.title} — teslim QR'ı hazırlandı`,
          status: "bekliyor",
          esenlinkSync: "pending",
          createdAt: new Date().toISOString(),
        },
        ...s.pointTransactions,
      ],
    }));
  },

  completeRequest: (requestId) => {
    const req = get().requests.find((r) => r.id === requestId);
    if (!req) return;
    const item = get().items.find((i) => i.id === req.itemId);
    set((s) => {
      let pts = s.pointTransactions;
      const existing = pts.find(
        (t) =>
          t.itemId === req.itemId &&
          t.userId === req.ownerId &&
          t.status === "bekliyor",
      );
      if (existing) {
        pts = pts.map((t) =>
          t.id === existing.id
            ? {
                ...t,
                status: "tamamlandi",
                esenlinkSync: "synced",
                reason: `${item?.title ?? "Ürün"} teslim edildi`,
              }
            : t,
        );
      } else if (item) {
        pts = [
          {
            id: uid("pt"),
            userId: req.ownerId,
            itemId: item.id,
            points: item.ecoPointReward,
            reason: `${item.title} teslim edildi`,
            status: "tamamlandi",
            esenlinkSync: "synced",
            createdAt: new Date().toISOString(),
          },
          ...pts,
        ];
      }
      return {
        requests: s.requests.map((r) =>
          r.id === requestId
            ? { ...r, status: "tamamlandi", completedAt: new Date().toISOString() }
            : r,
        ),
        items: s.items.map((i) =>
          i.id === req.itemId ? { ...i, status: "tamamlandi" } : i,
        ),
        users: s.users.map((u) =>
          u.id === req.ownerId && item
            ? { ...u, ecoPointBalance: u.ecoPointBalance + item.ecoPointReward }
            : u,
        ),
        pointTransactions: pts,
      };
    });
  },

  cancelRequest: (requestId) => {
    const req = get().requests.find((r) => r.id === requestId);
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId ? { ...r, status: "iptal" } : r,
      ),
      items: req
        ? s.items.map((i) =>
            i.id === req.itemId ? { ...i, status: "aktif" } : i,
          )
        : s.items,
      // Cancelled handovers do not earn points: remove any pending tx
      pointTransactions: req
        ? s.pointTransactions.filter(
            (t) =>
              !(
                t.itemId === req.itemId &&
                t.userId === req.ownerId &&
                t.status === "bekliyor"
              ),
          )
        : s.pointTransactions,
    }));
  },

  removeItem: (itemId) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === itemId ? { ...i, status: "kaldirildi" } : i,
      ),
    })),

  updateItemImage: (itemId, emoji) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === itemId ? { ...i, images: [emoji] } : i,
      ),
    })),

  approveItem: (itemId) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === itemId ? { ...i, status: "aktif" } : i,
      ),
    })),

  rejectItem: (itemId) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === itemId ? { ...i, status: "reddedildi" } : i,
      ),
    })),

  reportItem: (itemId, reason) =>
    set((s) => ({
      reports: [
        {
          id: uid("rep"),
          itemId,
          reporterId: s.currentUserId,
          reason,
          status: "acik",
          createdAt: new Date().toISOString(),
        },
        ...s.reports,
      ],
    })),

  retrySyncTx: (txId) =>
    set((s) => ({
      pointTransactions: s.pointTransactions.map((t) =>
        t.id === txId
          ? { ...t, esenlinkSync: "synced", status: "tamamlandi" }
          : t,
      ),
    })),

  freezeTx: (txId) =>
    set((s) => ({
      pointTransactions: s.pointTransactions.map((t) =>
        t.id === txId ? { ...t, status: "donduruldu" } : t,
      ),
    })),

  reverseTx: (txId) =>
    set((s) => {
      const tx = s.pointTransactions.find((t) => t.id === txId);
      return {
        pointTransactions: s.pointTransactions.map((t) =>
          t.id === txId ? { ...t, status: "iade" } : t,
        ),
        users: tx
          ? s.users.map((u) =>
              u.id === tx.userId
                ? {
                    ...u,
                    ecoPointBalance: Math.max(0, u.ecoPointBalance - tx.points),
                  }
                : u,
            )
          : s.users,
      };
    }),
}));

export const useCurrentUser = () =>
  useStore((s) => s.users.find((u) => u.id === s.currentUserId)!);
