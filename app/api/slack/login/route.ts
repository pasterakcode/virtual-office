export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = process.env.SLACK_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("[SLACK LOGIN] Missing env vars", {
      SLACK_CLIENT_ID: !!clientId,
      SLACK_REDIRECT_URI: !!redirectUri,
    });

    return NextResponse.json(
      { error: "Slack OAuth misconfigured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "users:read users:read.email",
    redirect_uri: redirectUri,
  });

  return NextResponse.redirect(
    `https://slack.com/oauth/v2/authorize?${params.toString()}`
  );
}
