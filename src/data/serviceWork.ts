import { brandingArtwork } from "./brandingArtwork";
import { contentArtwork } from "./contentArtwork";
import { websiteArtwork } from "./websiteArtwork";

/** One piece of work shown on a service page. `alt` reads "Client · Piece". */
export interface WorkPiece {
  src: string;
  alt: string;
}

const base = import.meta.env.BASE_URL;
const pf = (folder: string, file: string) => `${base}portfolio/${folder}/${file}`;
const show = (file: string) => `${base}showcase/${file}.webp`;
const SOCIAL = "Creative Campaign + Social Media";
const BANNERS = "Website Banners + Assets";

const strip = (list: readonly { src: string; alt: string }[]): WorkPiece[] => list.map(({ src, alt }) => ({ src, alt }));

const content = strip(contentArtwork);
const byClient = (name: string) => content.filter((w) => w.alt.startsWith(name));

/** Website banners (desktop slides) for Cloud Apparels' storefront. */
const cloudBanners: WorkPiece[] = [
  ["Banner 1 - Slide 1", "Hero banner 1 · Slide 1"],
  ["Banner 1 - Slide 2", "Hero banner 1 · Slide 2"],
  ["Banner 1 - Slide 3", "Hero banner 1 · Slide 3"],
  ["Banner 2 - Slide 1", "Hero banner 2 · Slide 1"],
  ["Banner 2 - Slide 2", "Hero banner 2 · Slide 2"],
  ["Banner 3 - Slide 1", "Hero banner 3 · Slide 1"],
  ["Banner 3 - Slide 2", "Hero banner 3 · Slide 2"],
  ["Banner 4 - Slide 1", "Hero banner 4 · Slide 1"],
  ["Banner 4 - Slide 2", "Hero banner 4 · Slide 2"],
].map(([f, a]) => ({ src: pf(BANNERS, `${f} copy.webp`), alt: `Cloud Apparels · ${a}` }));

/** Mobile banners for Cricketeria's e-commerce store. */
const cricketeriaBanners: WorkPiece[] = [
  ["Main_hero_mobile_banner_slide1", "Mobile hero banner · Slide 1"],
  ["Main_hero_mobile_banner_slide2", "Mobile hero banner · Slide 2"],
  ["Main_hero_mobile_banner_slide3", "Mobile hero banner · Slide 3"],
  ["Bats_mobile_Home_Screen_banner", "Bats · Home screen banner"],
  ["Bats_mobile_dedicated_page_banner", "Bats · Category page banner"],
  ["Fielding_wicketkeeping_home_screen_banner", "Fielding & wicketkeeping · Home banner"],
  ["Fielding_wicketkeeping_dedicated_page_main_banner", "Fielding & wicketkeeping · Category banner"],
  ["Junior_mobile_Home_Screen_banner", "Junior range · Home banner"],
  ["Junior_mobile_Dedicated_Page_banner", "Junior range · Category banner"],
  ["Women_mobile_Home_Screen_banner", "Women's range · Home banner"],
  ["Women_mobile_Dedicated_Page_banner", "Women's range · Category banner"],
  ["Clubs_and_academies_mobile_Home_Screen_banner", "Clubs & academies · Home banner"],
  ["Bat_care_mobile_homescreen_banner", "Bat care · Home banner"],
].map(([f, a]) => ({ src: pf(BANNERS, `${f} copy.webp`), alt: `Cricketeria · ${a}` }));

/** Photography and film stills from the showcase folder. */
const shoots: WorkPiece[] = [
  { src: show("a04"), alt: "Cloud Apparels · Cloud Aura campaign shoot" },
  { src: show("a06"), alt: "Editorial · Heritage fashion shoot" },
  { src: show("t12"), alt: "Cricketeria · Match-day action shoot" },
  { src: show("a05"), alt: "Lspace · Ambient lighting interiors" },
  { src: show("a10"), alt: "Purple Curve · Kaftan collection shoot" },
  { src: show("a07"), alt: "Editorial · Fabric in motion" },
  { src: show("t11"), alt: "Cricketeria · Junior squad shoot" },
  { src: show("t03"), alt: "Purple Curve · Studio collection shoot" },
  { src: show("t01"), alt: "Cloud Apparels · Product shoot" },
  { src: show("t02"), alt: "Lspace · Festive campaign still" },
  { src: show("t10"), alt: "Cloud Apparels · Fabric detail" },
  { src: show("a02"), alt: "Cloud Apparels · Storefront signage" },
  { src: show("t07"), alt: "Cricketeria · Product shoot" },
  { src: show("a03"), alt: "Cricketeria · Hoodie product shot" },
];

export const serviceWork: Record<string, WorkPiece[]> = {
  "branding-design": strip(brandingArtwork),
  "content-creation-animation": content,
  "social-media-management": [...byClient("Purple Curve"), ...byClient("Lspace"), ...byClient("Cloud Apparels")],
  "meta-ads": [
    { src: show("t01"), alt: "Cloud Apparels · “Don't buy this shirt” ad" },
    ...byClient("Cloud Apparels").slice(2, 5),
    { src: show("t10"), alt: "Cloud Apparels · Fabric heritage ad" },
    ...cricketeriaBanners.slice(3, 5),
    ...byClient("Purple Curve").slice(0, 8),
    ...byClient("Cloud Apparels").slice(5, 8),
    ...cloudBanners.slice(0, 4),
    ...cricketeriaBanners.slice(0, 4),
  ],
  "website-design-development": [...strip(websiteArtwork), ...cloudBanners, ...cricketeriaBanners],
  // Placeholder until technical work is supplied.
  "technical-graphics-animation": [...shoots, ...cloudBanners.slice(0, 4)],
};
