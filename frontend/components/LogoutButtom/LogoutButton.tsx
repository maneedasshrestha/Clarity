"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { FiLogOut } from "react-icons/fi";

const LogoutButton = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  return (
    <Button onClick={handleLogout}> 
      <FiLogOut size={20} />
      Logout
    </Button>
  );
};

export default LogoutButton;
