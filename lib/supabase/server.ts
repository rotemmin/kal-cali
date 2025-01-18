import {
  PRIVATE_SUPABASE_SERVICE_KEY,
  PUBLIC_SUPABASE_URL,
} from "@/lib/config";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  const supabaseClient = createServerClient(
    PUBLIC_SUPABASE_URL,
    PRIVATE_SUPABASE_SERVICE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value || null;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (cookieStore.get(name)?.value !== value) {
            cookieStore.set({ name, value, ...options });
          }
        },
        remove(name: string, options: CookieOptions) {
          if (cookieStore.get(name)?.value) {
            cookieStore.set({ name, value: "", ...options });
          }
        },
      },
    }
  );

  return supabaseClient;
};
