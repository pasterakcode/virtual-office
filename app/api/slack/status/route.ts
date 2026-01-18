import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { data } = await supabaseServer
    .from("slack_auth")
    .select("id")
    .limit(1)
    .single();

  return NextResponse.json({
    connected: !!data,
  });
}
