import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bgysyydlhysqtkwtoxuv.supabase.co";
const SUPABASE_KEY = "sb_publishable_tOz67UZxDgonFPfJOIJIpw_SfF6aEAp";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
