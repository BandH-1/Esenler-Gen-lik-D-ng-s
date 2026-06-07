/**
 * Lightweight, heuristic content moderation for community comments.
 *
 * The platform's core rules forbid selling, payment, shipping and sharing
 * personal contact/address info — so the moderator flags those, plus insults.
 * Matching is diacritic-insensitive (Turkish folded to ASCII) and uses word
 * boundaries to keep false positives low. It is intentionally conservative:
 * it is a guardrail, not a perfect filter.
 */

export type ViolationType = "kufur" | "iletisim" | "satis" | "spam";

export const VIOLATION_LABELS: Record<ViolationType, string> = {
  kufur: "Hakaret / küfür",
  iletisim: "Kişisel iletişim veya adres paylaşımı",
  satis: "Satış, ücret veya ödeme talebi",
  spam: "Bağlantı / spam",
};

export interface ModerationResult {
  ok: boolean;
  violations: ViolationType[];
  /** User-facing Turkish explanation. */
  message: string;
}

/** Fold Turkish text to lowercase ASCII for diacritic-insensitive matching. */
function fold(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
}

// Folded (ASCII) profanity / insult roots. Matched with word boundaries.
const PROFANITY = [
  "amk", "aq", "amina", "aminako", "anani", "ananisik",
  "orospu", "orospucocugu", "pic", "yavsak",
  "siktir", "sikeyim", "sikerim", "sikik", "sikim", "siktigim", "sikecem",
  "gotveren", "gotlek", "pust", "pezevenk", "gavat", "kahpe", "surtuk",
  "salak", "aptal", "gerizekali", "ahmak", "dangalak", "sersem", "gerzek",
  "manyak", "embesil", "ibne", "godoş",
];
const profanityRe = new RegExp(`\\b(?:${PROFANITY.join("|")})\\b`);

// Off-platform contact / address sharing.
const phoneRe = /(?:\+?\d[\s().-]?){10,}/; // 10+ digits, separators allowed
const emailRe = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const contactKeywordsRe =
  /\b(?:whatsapp|whatsap|watsap|wp|telegram|instagram|insta|snapchat|numaram|numaran|numaranizi|telefonum|telefon numara|ara beni|beni ara|dm at|dm den|adresim|adresime|ev adresi|kapi no|daire no)\b/;

// Sale / payment solicitation (platform is free-only).
const saleKeywordsRe =
  /\b(?:satiyorum|satarim|satilik|satista|satayim|kac para|kaca|fiyati?|fiyatina|pazarlik|kapora|depozito|iban|odeme yap|oderim|ucretli|para gonder|nakit|elden satis)\b/;
const currencyRe = /(?:₺|\btl\b|\blira\b)\s?\d|\d\s?(?:₺|\btl\b|\blira\b)/;

// External links / spam.
const linkRe = /(?:https?:\/\/|www\.|t\.me\/|bit\.ly|\b\w+\.(?:com|net|org|io|xyz)\b)/i;

export function moderateComment(raw: string): ModerationResult {
  const text = raw ?? "";
  const folded = fold(text);
  const violations: ViolationType[] = [];

  if (profanityRe.test(folded)) violations.push("kufur");

  if (
    phoneRe.test(text) ||
    emailRe.test(text) ||
    contactKeywordsRe.test(folded)
  ) {
    violations.push("iletisim");
  }

  if (saleKeywordsRe.test(folded) || currencyRe.test(folded)) {
    violations.push("satis");
  }

  if (linkRe.test(text)) violations.push("spam");

  if (violations.length === 0) {
    return { ok: true, violations: [], message: "" };
  }

  const labels = violations.map((v) => VIOLATION_LABELS[v]).join(", ");
  return {
    ok: false,
    violations,
    message: `Yorumun topluluk kurallarına aykırı bulundu (${labels}).`,
  };
}
