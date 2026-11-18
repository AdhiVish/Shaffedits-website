import { motion } from "motion/react";
import { Instagram, ArrowUpRight } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";

const INSTAGRAM_URL = "https://www.instagram.com/shaffedits/";

// Six Instagram tiles. To add a real photo, import it at the top of this file
// (e.g. `import post1 from "@/assets/socials/post-1.jpg";`) and set `image: post1`.
// Tiles without an image show a placeholder.
const posts: { image?: string; alt: string }[] = [
  { alt: "Instagram post 1" },
  { alt: "Instagram post 2" },
  { alt: "Instagram post 3" },
  { alt: "Instagram post 4" },
  { alt: "Instagram post 5" },
  { alt: "Instagram post 6" },
];

export function Socials() {
  return (
    <section
      id="socials"
      aria-labelledby="socials-title"
      className="relative overflow-hidden bg-[#050505] px-6 pt-32 pb-8 text-white md:pt-44"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/50">
              On the Feed / 03c
            </p>
            <h2
              id="socials-title"
              className="max-w-3xl font-display text-[clamp(2rem,5vw,4rem)] font-black leading-none tracking-tight"
            >
              Check us out on <span className="italic font-light text-white/60">socials</span>
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="chrome-text inline-flex items-center gap-2 text-sm font-semibold tracking-wide"
          >
            @shaffedits <ArrowUpRight className="h-4 w-4 text-white/60" aria-hidden />
          </a>
        </div>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {posts.map((post, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,#1c1c1c_0%,#0a0a0a_70%)] text-white/25">
                    <Instagram className="h-8 w-8 md:h-10 md:w-10" aria-hidden />
                    <span className="text-[10px] uppercase tracking-[0.35em]">
                      Photo {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center md:mt-16">
          <GlowButton as="a" href={INSTAGRAM_URL}>
            <Instagram className="h-4 w-4" aria-hidden />
            Follow us on Instagram
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
