export type DeskPresence = "online" | "busy" | "offline";

export type Desk = {
  id: string;
  name: string;
  presence: DeskPresence;
};
