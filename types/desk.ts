export type DeskPresence = "online" | "busy" | "offline";

export type Desk = {
  id: string;
  name: string;
  presence: DeskPresence;
  slackUserId?: string;

  // ✅ status ze Slacka (custom status)
  status_text?: string | null;
  status_emoji?: string | null;
};
