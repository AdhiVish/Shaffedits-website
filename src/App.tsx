import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Preloader } from "@/components/layout/Preloader";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpotlightProvider } from "@/components/ui/SpotlightProvider";
import { ScrollToHash, scrollToTopNow } from "@/components/routing/ScrollToHash";
import { SmoothScroll } from "@/components/wild/SmoothScroll";
import { SheenPauser } from "@/components/wild/SheenPauser";
import { Grain, ScrollHUD } from "@/components/wild/ScrollHUD";

import Home from "@/pages/Home";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

import BrandingDesign from "@/pages/services/BrandingDesign";
import ContentCreationAnimation from "@/pages/services/ContentCreationAnimation";
import SocialMediaManagement from "@/pages/services/SocialMediaManagement";
import VideographyPhotography from "@/pages/services/VideographyPhotography";
import MetaAds from "@/pages/services/MetaAds";
import WebsiteDesignDevelopment from "@/pages/services/WebsiteDesignDevelopment";

function App() {
  const location = useLocation();
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <SheenPauser />
      <ScrollHUD />
      <Grain />
      <SpotlightProvider />
      <ScrollToHash />
      <Navbar />
      <main className="bg-black">
        {/* lets a page (e.g. About) play its exit animation before the next one mounts */}
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => !window.location.hash && scrollToTopNow()}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route path="/services" element={<Navigate to="/#services" replace />} />
          <Route path="/services/branding-design" element={<BrandingDesign />} />
          <Route
            path="/services/content-creation-animation"
            element={<ContentCreationAnimation />}
          />
          <Route
            path="/services/social-media-management"
            element={<SocialMediaManagement />}
          />
          <Route
            path="/services/videography-photography"
            element={<VideographyPhotography />}
          />
          <Route path="/services/meta-ads" element={<MetaAds />} />
          <Route
            path="/services/website-design-development"
            element={<WebsiteDesignDevelopment />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}

export default App;
