import { ShieldCheck } from "lucide-react";

export function SafetyNote({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent-foreground ring-1 ring-accent/20">
        <ShieldCheck className="h-3.5 w-3.5 text-accent" />
        Ücretsiz · Güvenli Teslim Noktası · QR Onayı
      </div>
    );
  }
  return (
    <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl border border-accent/30 bg-accent/10 p-4">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{
          background: "radial-gradient(circle, var(--accent), transparent 70%)",
        }}
      />
      <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="relative text-sm leading-relaxed text-foreground">
        <p className="font-semibold">Güvenli takas kuralları</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
          <li>Tüm eşyalar ücretsiz devredilir, ödeme yapılmaz.</li>
          <li>Teslim yalnızca belediyenin güvenli noktalarında yapılır.</li>
          <li>Ev adresi paylaşılmaz, kargo yoktur.</li>
          <li>Puanlar yalnızca QR onaylı teslimden sonra eklenir.</li>
        </ul>
      </div>
    </div>
  );
}
