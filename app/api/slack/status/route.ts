import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("slack_installations")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[SLACK STATUS ERROR]", error);
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: !!data,
  });
}
