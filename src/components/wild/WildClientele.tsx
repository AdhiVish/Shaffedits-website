import { VelocityMarquee } from "./VelocityMarquee";

const L = (f: string) => `${import.meta.env.BASE_URL}logo/${f}`;

const clients = [
  ["BL", "BL copy.webp"],
  ["DR Layla", "DR Layla copy.webp"],
  ["Final Horizontal", "Final Horizontal Black copy.webp"],
  ["JBK Controls", "JBK Controls copy.webp"],
  ["JR Dental", "JR Dental Logo Horizontal Black copy.webp"],
  ["Logo Horizontal", "Logo Horizontal Black copy.webp"],
  ["Logotype", "Logotype Black copy.webp"],
  ["Lspace", "Lspace_Logo_Horizontal copy.webp"],
  ["Synergy Oils", "Synergy Oils copy.webp"],
  ["The Sheikh Shawarma", "The Sheikh Shawarma Logo Black Version copy.webp"],
  ["Untangle", "Untangle_LogosV6-05 copy 2.webp"],
  ["Wanaromah", "Wanaromah copy.webp"],
  ["Attea", "attea logo copy.webp"],
  ["Kenrich International School", "kenrich international school copy.webp"],
  ["Organic Ocean", "organic ocean copy.webp"],
  ["Purple Curve", "purple curve copy.webp"],
  ["Saregama", "saregama copy.webp"],
  ["Seth G Exims", "seth G exims copy.webp"],
] as const;

function Logo({ name, file }: { name: string; file: string }) {
  return (
    <div className="flex h-14 w-24 shrink-0 items-center justify-center px-3 md:h-28 md:w-56 md:px-6">
      <img
        src={L(file)}
        alt={name}
        title={name}
        loading="lazy"
        draggable={false}
        className="max-h-8 w-auto md:max-h-14 max-w-full object-contain opacity-70 grayscale transition-all duration-300 hover:scale-110 hover:opacity-100 hover:grayscale-0"
      />
    </div>
  );
}

export function WildClientele() {
  const half = Math.ceil(clients.length / 2);
  return (
    <section className="overflow-hidden bg-white py-16 text-black md:py-32">
      <div className="mx-auto mb-10 md:mb-14 max-w-4xl px-6 text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-[#2641FF]">Clientele / 04</p>
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-none tracking-tight">
          Brands that trust <span className="chrome-text pr-[0.06em] font-light italic">Shaffedits</span>
        </h2>
        <p className="mt-4 text-sm text-black/50">
          <span className="font-semibold text-[#2641FF]">40+ brands</span> · (scroll faster, they get excited)
        </p>
      </div>
      <div aria-hidden className="neon-line h-[2px]" />
      <VelocityMarquee baseVelocity={1.6} className="border-b border-black/10">
        {clients.slice(0, half).map(([n, f]) => (
          <Logo key={n} name={n} file={f} />
        ))}
      </VelocityMarquee>
      <VelocityMarquee baseVelocity={-1.3}>
        {clients.slice(half).map(([n, f]) => (
          <Logo key={n} name={n} file={f} />
        ))}
      </VelocityMarquee>
      <div aria-hidden className="neon-line h-[2px]" />
    </section>
  );
}
