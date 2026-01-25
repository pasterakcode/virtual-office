import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { user, checked } = await req.json();

    if (!user?.id || !user?.name) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (checked) {
      // INSERT
      const { error } = await supabaseServer.from("desks").insert({
        id: user.id,
        slack_user_id: user.id,
        name: user.name,
        presence: "offline", // default, Slack presence i tak nadpisze
      });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    } else {
      // DELETE
      const { error } = await supabaseServer
        .from("desks")
        .delete()
        .eq("slack_user_id", user.id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DESKS TOGGLE ERROR]", e);
    return NextResponse.json(
      { error: "Toggle failed" },
      { status: 500 }
    );
  }
}
