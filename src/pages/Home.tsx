import { Hero } from "@/components/sections/Hero";
import { Showreel } from "@/components/sections/Showreel";
import { Team } from "@/components/sections/Team";
import { Socials } from "@/components/sections/Socials";
import { Testimonials } from "@/components/sections/Testimonials";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { ServiceBands, WildServices } from "@/components/wild/WildServices";
import { Stats } from "@/components/wild/Stats";
import { SelectedWork } from "@/components/wild/SelectedWork";
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
      <ServiceBands />
      <WildServices />
      <Stats />
      <SelectedWork />
      <Showreel />
      <Socials />
      <Team />
      <WildClientele />
      <Testimonials />
      <BigOutro />
      <ContactCTA />
    </>
  );
}
