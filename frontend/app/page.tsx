import HeroSection from "@/components/HeroSection/HeroSection";
import MainNavbar from "@/components/Navbar/Navbar";

const HomePage = () => {
  return (
    <>
      <MainNavbar />
      <HeroSection
        auroraProps={{
          colorStops: ["#0612bc", "#0f30d7", "#3e2a8d"],
          blend: 0.28,
          amplitude: 1.0,
          speed: 0.4,
        }}
      />
    </>
  );
};

export default HomePage;
