import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "no code" }, { status: 400 });
    }

    const res = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const data = await res.json();

    console.log("SLACK DATA", data);

    if (!data.ok) {
      return NextResponse.json(data, { status: 400 });
    }

    const { error } = await supabaseServer.from("slack_auth").insert({
      access_token: data.access_token,
      team_id: data.team.id,
      team_name: data.team.name,
    });

    if (error) {
      console.error("SUPABASE ERROR", error);
      return NextResponse.json(error, { status: 500 });
    }

    return NextResponse.redirect("/admin");
  } catch (e) {
    console.error("CALLBACK CRASH", e);
    return NextResponse.json({ error: "callback crashed" }, { status: 500 });
  }
}
