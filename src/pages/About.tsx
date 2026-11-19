import { SEOHead } from "@/components/services";
import { Manifesto } from "@/components/wild/Manifesto";

/** The About page: the "About / 01" manifesto that used to sit on the home page. */
export default function About() {
  return (
    <>
      <SEOHead
        title="Shaffedits | About"
        description="Shaffedits is a multidisciplinary creative agency bringing branding, content, design, digital strategy, filmmaking and web experiences under one creative roof."
        path="/about"
      />
      <Manifesto page />
    </>
  );
}
