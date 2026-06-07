import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type EcoTx =
  Database["public"]["Tables"]["eco_point_transactions"]["Row"];
export type EcoTxStatus = EcoTx["status"];
export type EcoTxType = EcoTx["transaction_type"];

export const TX_STATUS_LABELS: Record<EcoTxStatus, string> = {
  pending: "Bekliyor",
  completed: "Tamamlandı",
  synced_to_esenlink: "Esenlink'e Aktarıldı",
  failed: "Başarısız",
};

export const TX_TYPE_LABELS: Record<EcoTxType, string> = {
  earned_from_giving: "Veriden Kazanım",
  bonus: "Bonus",
  penalty: "Ceza",
  adjustment: "Düzeltme",
  integration_sync: "Esenlink Senkron",
};

export const TX_SYNC_FROM_STATUS = (s: EcoTxStatus) =>
  s === "synced_to_esenlink"
    ? "synced"
    : s === "pending"
      ? "pending"
      : s === "failed"
        ? "failed"
        : "demo";

export async function fetchTransactions(opts: {
  userId?: string;
  from?: string;
  to?: string;
} = {}): Promise<EcoTx[]> {
  let q = supabase
    .from("eco_point_transactions")
    .select("*")
    .order("created_at", { ascending: false });
  if (opts.userId) q = q.eq("user_id", opts.userId);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export type MonthlyRow = {
  month: string; // YYYY-MM
  label: string; // Tem 2026
  earned: number;
  pending: number;
  penalty: number;
  net: number;
  count: number;
};

const TR_MONTHS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

export function monthlySummary(txs: EcoTx[]): MonthlyRow[] {
  const map = new Map<string, MonthlyRow>();
  for (const t of txs) {
    const d = new Date(t.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const row =
      map.get(key) ??
      {
        month: key,
        label: `${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        earned: 0,
        pending: 0,
        penalty: 0,
        net: 0,
        count: 0,
      };
    row.count++;
    if (t.status === "pending") row.pending += t.points;
    else if (t.transaction_type === "penalty")
      row.penalty += Math.abs(t.points);
    else if (t.status === "completed" || t.status === "synced_to_esenlink")
      row.earned += t.points;
    row.net = row.earned - row.penalty;
    map.set(key, row);
  }
  return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
}

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(
  filename: string,
  rows: Record<string, string | number>[],
) {
  if (!rows.length) {
    const blob = new Blob(["\uFEFF"], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, filename);
    return;
  }
  const headers = Object.keys(rows[0]);
  const body = rows
    .map((r) => headers.map((h) => csvEscape(r[h])).join(","))
    .join("\n");
  const csv = "\uFEFF" + headers.join(",") + "\n" + body;
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Light ASCII fold so jsPDF's built-in font renders Turkish text legibly
function fold(s: string): string {
  return s
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ç/g, "c").replace(/Ç/g, "C");
}

export function downloadTxPdf(
  filename: string,
  title: string,
  rows: Record<string, string | number>[],
  summaryRows?: Record<string, string | number>[],
) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(fold(title), 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    fold(
      `Olusturma: ${new Date().toLocaleString("tr-TR")} — Esenler Belediyesi / Genclik Dongusu`,
    ),
    14,
    22,
  );

  let y = 28;
  if (summaryRows && summaryRows.length) {
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(fold("Aylik Ozet"), 14, y);
    y += 3;
    autoTable(doc, {
      startY: y + 2,
      head: [Object.keys(summaryRows[0]).map(fold)],
      body: summaryRows.map((r) => Object.values(r).map((v) => fold(String(v)))),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [16, 122, 88], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    // @ts-expect-error autotable injects lastAutoTable
    y = doc.lastAutoTable.finalY + 8;
  }

  if (rows.length) {
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text(fold("Islem Gecmisi"), 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [Object.keys(rows[0]).map(fold)],
      body: rows.map((r) => Object.values(r).map((v) => fold(String(v)))),
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [16, 122, 88], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save(filename);
}
