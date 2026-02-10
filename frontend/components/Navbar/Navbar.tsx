import {
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
} from "@/components/Navbar/resizable-navbar";
import ThemeToggle from "@/components/Theme/ThemeToggle";

const MainNavbar = () => {
  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <div className="flex items-center gap-4">
          <NavbarButton variant="secondary" href="/login">
            Login
          </NavbarButton>
          <ThemeToggle />
        </div>
      </NavBody>
    </Navbar>
  );
};

export default MainNavbar;
