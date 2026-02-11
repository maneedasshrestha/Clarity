"use client";
import {
  MobileNav,
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
} from "@/components/Navbar/resizable-navbar";
import ThemeToggle from "@/components/Theme/ThemeToggle";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButtom/LogoutButton";
import { User } from "@supabase/supabase-js";
import { useMediaQuery } from "react-responsive";

const MainNavbar = () => {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="mx-4 w-full">
      <Navbar>
        {isDesktop ? (
          <NavBody>
            <NavbarLogo />
            <ThemeToggle />
          </NavBody>
        ) : (
          <MobileNav className="">
            <div className="flex flex-row items-center w-full justify-between">
              <NavbarLogo />
              <ThemeToggle />
            </div>
          </MobileNav>
        )}
      </Navbar>
    </div>
  );
};

export default MainNavbar;
