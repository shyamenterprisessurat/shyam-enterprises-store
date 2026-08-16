import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yoxfdnkejkrafxerlkod.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_8d1_8jxcw9bAM1fTPI1YFw_yT0eTLAm";
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
