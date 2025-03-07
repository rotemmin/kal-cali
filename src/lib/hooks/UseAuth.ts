import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const useAuth = () => {
  const signOut = async () => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();

    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");

    return redirect("/");
  };
  return { signOut };
};

export default useAuth;
