"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButtom/LogoutButton";
import Loader from "@/components/Loader";
import MainNavbar from "@/components/Navbar/Navbar";
import BottomNavBar from "@/components/BottomNavBar/BottomNav";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) return <Loader />;
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />
      <main className="flex-1 flex flex-col items-center justify-center mt-[150]">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default DashboardLayout;
