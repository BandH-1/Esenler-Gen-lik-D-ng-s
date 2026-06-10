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
  "amk",
  "aq",
  "amina",
  "aminako",
  "anani",
  "ananisik",
  "orospu",
  "orospucocugu",
  "pic",
  "yavsak",
  "siktir",
  "sikeyim",
  "sikerim",
  "sikik",
  "sikim",
  "siktigim",
  "sikecem",
  "gotveren",
  "gotlek",
  "pust",
  "pezevenk",
  "gavat",
  "kahpe",
  "surtuk",
  "salak",
  "aptal",
  "gerizekali",
  "ahmak",
  "dangalak",
  "sersem",
  "gerzek",
  "manyak",
  "embesil",
  "ibne",
  "godoş",
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

  if (phoneRe.test(text) || emailRe.test(text) || contactKeywordsRe.test(folded)) {
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

export interface ItemModerationResult {
  ok: boolean;
  violations: string[];
  message: string;
  mismatchDetected?: boolean;
  policyViolated?: boolean;
}

export function moderateItemSubmission(
  title: string,
  description: string,
  category: string,
  emoji: string,
  fileName?: string,
): ItemModerationResult {
  const violations: string[] = [];
  const foldedTitle = fold(title);
  const foldedDesc = fold(description);
  const combined = foldedTitle + " " + foldedDesc;

  // 1. Politika Uygunluğu Kontrolü
  if (profanityRe.test(combined)) {
    violations.push("Politika İhlali: Küfür veya hakaret içeriyor.");
  }
  if (phoneRe.test(combined) || emailRe.test(combined) || contactKeywordsRe.test(combined)) {
    violations.push(
      "Politika İhlali: Telefon, e-posta veya adres gibi kişisel iletişim bilgileri içeriyor. Paylaşımlar sadece güvenli noktada yapılmalıdır.",
    );
  }
  if (saleKeywordsRe.test(combined) || currencyRe.test(combined)) {
    violations.push(
      "Politika İhlali: Satış, ücret, takas veya ödeme talebi içeriyor. Bu platform tamamen ücretsizdir.",
    );
  }
  if (linkRe.test(combined)) {
    violations.push("Politika İhlali: Harici bağlantı veya spam içeriyor.");
  }

  // 2. Kategori / Görsel Uyuşmazlığı Kontrolü
  const categoryKeywords: Record<string, string[]> = {
    kitap: [
      "telefon",
      "kulaklik",
      "tablet",
      "bilgisayar",
      "mont",
      "pantolon",
      "ayakkabi",
      "esofman",
      "yatak",
      "koltuk",
      "lamba",
      "topu",
      "matı",
    ],
    kiyafet: [
      "kitap",
      "defter",
      "kalem",
      "tablet",
      "bilgisayar",
      "telefon",
      "sarj",
      "yatak",
      "koltuk",
      "lamba",
      "topu",
      "matı",
    ],
    okul: ["mont", "pantolon", "ayakkabi", "yatak", "koltuk", "lamba", "topu", "matı"],
    elektronik: [
      "kitap",
      "defter",
      "roman",
      "mont",
      "pantolon",
      "ayakkabi",
      "yatak",
      "koltuk",
      "lamba",
    ],
    spor: ["kitap", "defter", "roman", "mont", "pantolon", "yatak", "koltuk", "lamba"],
    yurt: ["roman", "kitap", "defter", "ayakkabi", "topu", "matı"],
  };

  const currentCategoryKeywords = categoryKeywords[category] || [];
  const detectedMismatchKeywords = currentCategoryKeywords.filter((kw) => combined.includes(kw));

  let fileMismatch = false;
  if (fileName) {
    const foldedFile = fold(fileName);
    if (
      category === "elektronik" &&
      (foldedFile.includes("kitap") ||
        foldedFile.includes("roman") ||
        foldedFile.includes("defter"))
    ) {
      fileMismatch = true;
    }
    if (
      category === "kitap" &&
      (foldedFile.includes("telefon") ||
        foldedFile.includes("kulaklik") ||
        foldedFile.includes("tablet") ||
        foldedFile.includes("bilgisayar") ||
        foldedFile.includes("makine"))
    ) {
      fileMismatch = true;
    }
  }

  if (detectedMismatchKeywords.length > 0 || fileMismatch) {
    violations.push(
      `Görsel / Kategori Uyuşmazlığı: İlan içeriği seçilen kategori (${category.toUpperCase()}) veya temsili görsel/fotoğraf ile uyuşmuyor.`,
    );
  }

  if (violations.length === 0) {
    return {
      ok: true,
      violations: [],
      message: "AI Taraması Başarılı: İlan kurallara ve politikalarımıza uygun.",
    };
  }

  return {
    ok: false,
    violations,
    message: violations.join("\n"),
    mismatchDetected: detectedMismatchKeywords.length > 0 || fileMismatch,
    policyViolated: violations.some((v) => v.startsWith("Politika")),
  };
}
