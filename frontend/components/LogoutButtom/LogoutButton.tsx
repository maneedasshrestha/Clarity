import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const LogoutButton = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("login");
  };
  return <Button onClick={handleLogout}>Logout</Button>;
};

export default LogoutButton;
