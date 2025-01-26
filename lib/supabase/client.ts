import { createBrowserClient } from "@supabase/ssr";
import {
  PRIVATE_SUPABASE_SERVICE_KEY,
  PUBLIC_SUPABASE_URL,
} from "@/lib/config";

// Create and export a single instance of Supabase client
export const supabase = createBrowserClient(
  PUBLIC_SUPABASE_URL,
  PRIVATE_SUPABASE_SERVICE_KEY
);
