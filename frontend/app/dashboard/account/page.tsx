"use client";
import Loader from "@/components/Loader";
import ProfilePage from "@/components/ProfilePage/ProfilePage";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

function AccountPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!user) return <Loader />;
  return (
    <ProfilePage
      name={user.user_metadata?.name || "Sun Dawg"}
      email={user.email}
    />
  );
}

export default AccountPage;
