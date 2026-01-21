# Audit Plan for Diagnosing Issues

This document will guide the step-by-step audit to identify where the project might be failing or broken.

## Steps:

1. Clarify the specific problem or error symptoms experienced.
2. Verify environment variables:
   - OPENAI_API_KEY
   - SLACK_CLIENT_ID
   - SLACK_CLIENT_SECRET
   - SLACK_REDIRECT_URI
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Test Slack OAuth flow:
   - Go through /api/slack/login and /api/slack/callback flow.
   - Check Slack tokens saved in Supabase slack_auth table.
4. Check Supabase connectivity and schema correctness.
5. Verify frontend AuthProvider properly fetches user & workspace.
6. Check if Slack users load correctly in AdminPanel.
7. Confirm that agent.js runs AI steps without errors (plan/chat/confirm/execute).
8. Review recent logs/errors from both frontend and backend.

Please provide more detailed error descriptions or logs so audit can be focused on actual problems.