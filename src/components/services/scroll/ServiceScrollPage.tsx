import { SEOHead } from "@/components/services/SEOHead";
import { getServiceContent } from "@/data/serviceContent";
import { serviceWork } from "@/data/serviceWork";
import { ScrollHero, WorkHelix, WorkWall } from "./WorkScenes";
import { CapabilityStack, ClosingZoom, EcosystemRows, FormulaCollide, ProcessRail, StatsBurst } from "./StoryScenes";

interface Props {
  slug: string;
  seo: { title: string; description: string; path: string };
  /** Heading over the work spiral: plain part + italic chrome part. */
  workTitle: [string, string];
}

/**
 * One scroll-driven template for all six service pages, so every page moves
 * the same way. The client work comes first, straight after the hero.
 *
 *   hero (headline scatters, work flies out)
 *   → the work: 3D spiral of highlights → tilted wall of every piece
 *   → capabilities stacking like a deck → process rail → numbers
 *   → "how it connects" collision → the other services → closing zoom
 */
export function ServiceScrollPage({ slug, seo, workTitle }: Props) {
  const content = getServiceContent(slug);
  const work = serviceWork[slug] ?? [];
  return (
    <>
      <SEOHead title={seo.title} description={seo.description} path={seo.path} />
      <ScrollHero content={content} work={work} />
      <WorkHelix work={work} title={workTitle} />
      <WorkWall work={work} />
      <CapabilityStack content={content} />
      <ProcessRail content={content} />
      <StatsBurst content={content} />
      <FormulaCollide content={content} />
      <EcosystemRows currentSlug={slug} />
      <ClosingZoom content={content} />
    </>
  );
}
