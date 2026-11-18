import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { Team } from "@/components/sections/Team";
import { Socials } from "@/components/sections/Socials";
import { Testimonials } from "@/components/sections/Testimonials";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { Manifesto } from "@/components/wild/Manifesto";
import { ServiceBands, WildServices } from "@/components/wild/WildServices";
import { Stats } from "@/components/wild/Stats";
import { WorkTunnel } from "@/components/wild/WorkTunnel";
import { WildClientele } from "@/components/wild/WildClientele";
import { BigOutro } from "@/components/wild/BigOutro";

/**
 * The scroll-driven home page. Every section reacts to the scroll:
 * pinned scenes, sideways tracks, a 3D tunnel and falling type.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <ServiceBands />
      <WildServices />
      <Stats />
      <WorkTunnel />
      <Portfolio />
      <Socials />
      <Team />
      <WildClientele />
      <Testimonials />
      <BigOutro />
      <ContactCTA />
    </>
  );
}
