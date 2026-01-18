import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST() {
  const supabase = supabaseServer();

  const { error } = await supabase
    .from("slack_installations")
    .delete()
    .neq("id", 0);

  if (error) {
    console.error("[SLACK LOGOUT ERROR]", error);
    return NextResponse.json(
      { ok: false },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}


