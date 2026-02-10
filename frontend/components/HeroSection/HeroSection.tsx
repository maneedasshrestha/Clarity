import React from "react";
import Aurora from "@/components/Aurora/Aurora";
import HeroContent from "@/components/HeroSection/HeroContent";

interface HeroSectionProps {
  auroraProps?: React.ComponentProps<typeof Aurora>;
}

const HeroSection: React.FC<HeroSectionProps> = ({ auroraProps }) => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Aurora {...(auroraProps || {})} />
      </div>
      <div className="relative z-20 w-full flex items-center justify-center min-h-[60vh] mt-[250]">
        <HeroContent />
      </div>
    </section>
  );
};

export default HeroSection;
