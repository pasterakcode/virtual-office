import { NextResponse } from "next/server";

export const runtime = "nodejs";

const getSlackConfig = () => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri =
    process.env.SLACK_REDIRECT_URI ??
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`
      : undefined);

  const missingEnv = [
    !clientId ? "SLACK_CLIENT_ID" : null,
    !redirectUri ? "SLACK_REDIRECT_URI" : null,
  ].filter((value): value is string => Boolean(value));

  return { clientId, redirectUri, missingEnv };
};

export async function GET() {
  const { clientId, redirectUri, missingEnv } = getSlackConfig();

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        error: "missing slack env vars",
        missing: missingEnv,
        hint: "Provide SLACK_CLIENT_ID and SLACK_REDIRECT_URI (or NEXT_PUBLIC_APP_URL).",
      },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId!,
    scope: "users:read users:read.email",
    redirect_uri: redirectUri!,
  });

  return NextResponse.redirect(
    `https://slack.com/oauth/v2/authorize?${params.toString()}`
  );
}
