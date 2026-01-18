import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const getSlackConfig = () => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const redirectUri =
    process.env.SLACK_REDIRECT_URI ??
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`
      : undefined);

  const missingEnv = [
    !clientId ? "SLACK_CLIENT_ID" : null,
    !clientSecret ? "SLACK_CLIENT_SECRET" : null,
    !redirectUri ? "SLACK_REDIRECT_URI" : null,
  ].filter((value): value is string => Boolean(value));

  return { clientId, clientSecret, redirectUri, missingEnv };
};

export async function GET(req: Request) {
  try {
    const { clientId, clientSecret, redirectUri, missingEnv } =
      getSlackConfig();

    if (missingEnv.length > 0) {
      return NextResponse.json(
        {
          error: "missing slack env vars",
          missing: missingEnv,
          hint: "Provide SLACK_CLIENT_ID/SLACK_CLIENT_SECRET and SLACK_REDIRECT_URI (or NEXT_PUBLIC_APP_URL).",
        },
        { status: 500 }
      );
    }

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
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri!,
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
    return NextResponse.redirect(
      new URL("/admin", process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (e) {
    console.error("CALLBACK CRASH", e);
    return NextResponse.json({ error: "callback crashed" }, { status: 500 });
  }
}
