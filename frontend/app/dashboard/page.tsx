"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LogoutButton from "@/components/LogoutButtom/LogoutButton";
import Loader from "@/components/Loader";

const Dashboard = () => {
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
    <div>
      <LogoutButton />
    </div>
  );
};

export default Dashboard;
