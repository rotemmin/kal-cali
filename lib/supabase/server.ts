import {
  PRIVATE_SUPABASE_SERVICE_KEY,
  PUBLIC_SUPABASE_URL,
} from "@/lib/config";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  try {
    return createServerClient(
      PUBLIC_SUPABASE_URL,
      PRIVATE_SUPABASE_SERVICE_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.error("Error setting cookie:", error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              console.error("Error removing cookie:", error);
            }
          },
        },
      }
    );
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    throw error;
  }
};
