import { NextResponse } from "next/server";

export async function GET() {
  const missingEnv = ["SLACK_CLIENT_ID", "SLACK_REDIRECT_URI"].filter(
    (key) => !process.env[key]
  );

  if (missingEnv.length > 0) {
    return NextResponse.json(
      { error: "missing slack env vars", missing: missingEnv },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: "users:read users:read.email",
    redirect_uri: process.env.SLACK_REDIRECT_URI!,
  });



  return NextResponse.redirect(
    `https://slack.com/oauth/v2/authorize?${params.toString()}`
  );
}
