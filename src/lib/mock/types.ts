import type { ViolationType } from "@/lib/moderation";

export type Category =
  | "kitap"
  | "kiyafet"
  | "okul"
  | "elektronik"
  | "spor"
  | "yurt";

export const CATEGORY_LABELS: Record<Category, string> = {
  kitap: "Kitap & Sınav Kaynakları",
  kiyafet: "Kıyafet",
  okul: "Okul Malzemeleri",
  elektronik: "Elektronik",
  spor: "Spor Ekipmanı",
  yurt: "Yurt & Öğrenci Eşyası",
};

/** Base reward per category (per Prompt 6 specification). */
export const CATEGORY_BASE_REWARD: Record<Category, number> = {
  kitap: 30, // includes exam prep treated as kitap
  kiyafet: 35,
  okul: 25,
  elektronik: 60,
  spor: 45,
  yurt: 50,
};

export type Condition = "yeni-gibi" | "iyi" | "orta" | "yipranmis";

export const CONDITION_LABELS: Record<Condition, string> = {
  "yeni-gibi": "Yeni Gibi",
  iyi: "İyi",
  orta: "Orta",
  yipranmis: "Yıpranmış",
};

/** Multipliers, rounded to nearest 5 after applying. */
export const CONDITION_MULTIPLIER: Record<Condition, number> = {
  "yeni-gibi": 1.2,
  iyi: 1.0,
  orta: 0.8,
  yipranmis: 0.5,
};

export function calculateEcoPoints(category: Category, condition: Condition): number {
  const raw = CATEGORY_BASE_REWARD[category] * CONDITION_MULTIPLIER[condition];
  return Math.round(raw / 5) * 5;
}

export type SchoolType = "lise" | "meslek-lisesi" | "universite";

export const SCHOOL_LABELS: Record<SchoolType, string> = {
  lise: "Lise",
  "meslek-lisesi": "Meslek Lisesi",
  universite: "Üniversite",
};

export type UserType = "ogrenci" | "yonetici";

export type VerificationStatus = "dogrulanmis" | "bekliyor" | "dogrulanmamis";

export type ItemStatus =
  | "incelemede"
  | "aktif"
  | "rezerve"
  | "teslim-planlandi"
  | "tamamlandi"
  | "reddedildi"
  | "kaldirildi";

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  incelemede: "İncelemede",
  aktif: "Aktif",
  rezerve: "Rezerve",
  "teslim-planlandi": "Teslim Planlandı",
  tamamlandi: "Tamamlandı",
  reddedildi: "Reddedildi",
  kaldirildi: "Kaldırıldı",
};

export type RequestStatus =
  | "talep-edildi"
  | "onaylandi"
  | "qr-hazir"
  | "tamamlandi"
  | "iptal"
  | "suresi-doldu";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  "talep-edildi": "Talep Edildi",
  onaylandi: "Onaylandı",
  "qr-hazir": "QR Hazır",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
  "suresi-doldu": "Süresi Doldu",
};

export type HandoverPointType =
  | "genclik-merkezi"
  | "kutuphane"
  | "kultur-merkezi"
  | "hizmet-binasi";

export const HANDOVER_TYPE_LABELS: Record<HandoverPointType, string> = {
  "genclik-merkezi": "Gençlik Merkezi",
  kutuphane: "Kütüphane",
  "kultur-merkezi": "Kültür Merkezi",
  "hizmet-binasi": "Hizmet Binası",
};

/** Eko-Puan transaction status. */
export type PointStatus = "bekliyor" | "tamamlandi" | "donduruldu" | "iade";

export const POINT_STATUS_LABELS: Record<PointStatus, string> = {
  bekliyor: "Aktarım Bekliyor",
  tamamlandi: "Esenlink'e Aktarıldı",
  donduruldu: "Dondurulmuş",
  iade: "Geri Alındı",
};

/** Esenlink sync status. */
export type EsenlinkSync = "synced" | "pending" | "failed" | "demo";

export const ESENLINK_SYNC_LABELS: Record<EsenlinkSync, string> = {
  synced: "Esenlink'e Aktarıldı",
  pending: "Aktarım Bekliyor",
  failed: "Aktarım Başarısız",
  demo: "Demo Modu",
};

export interface User {
  id: string;
  name: string;
  userType: UserType;
  schoolType: SchoolType;
  age: number;
  neighborhood: string;
  verificationStatus: VerificationStatus;
  ecoPointBalance: number;
  trustScore: number;
  avatarColor: string;
  /** Community moderation state. */
  banned?: boolean;
  banReason?: string;
  /** Number of blocked community actions; auto-ban triggers at STRIKE_LIMIT. */
  strikes?: number;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  images: string[];
  ownerId: string;
  neighborhood: string;
  handoverPointId: string;
  status: ItemStatus;
  ecoPointReward: number;
  attributes?: Record<string, string>;
  createdAt: string;
}

export interface ExchangeRequest {
  id: string;
  itemId: string;
  requesterId: string;
  ownerId: string;
  status: RequestStatus;
  qrCode: string;
  handoverPointId: string;
  createdAt: string;
  completedAt?: string;
}

export interface HandoverPoint {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  openingHours: string;
  type: HandoverPointType;
  qrEnabled: boolean;
}

export interface PointTransaction {
  id: string;
  userId: string;
  itemId?: string;
  points: number;
  reason: string;
  status: PointStatus;
  esenlinkSync: EsenlinkSync;
  createdAt: string;
}

export interface Report {
  id: string;
  itemId: string;
  reporterId: string;
  reason: string;
  status: "acik" | "incelemede" | "kapali";
  createdAt: string;
}

export type CommentStatus = "yayinda" | "engellendi";

export interface Comment {
  id: string;
  itemId: string;
  userId: string;
  text: string;
  status: CommentStatus;
  violations: ViolationType[];
  createdAt: string;
}

export type ModerationEventType = "engellendi" | "ban" | "ban-kaldirildi";

export interface ModerationEvent {
  id: string;
  userId: string;
  itemId?: string;
  type: ModerationEventType;
  violations: ViolationType[];
  text?: string;
  createdAt: string;
}
