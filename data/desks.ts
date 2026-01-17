export type Desk = {
  id: string;
  slackUserId: string;
  name: string;
  status: "active" | "inactive";
  presence: "available" | "busy" | "offline";
  unreadCount: number;
};

export const desks: Desk[] = [
  {
    id: "1",
    slackUserId: "U00000001",
    name: "Anna",
    status: "active",
    presence: "available",
    unreadCount: 2,
  },
  {
    id: "2",
    slackUserId: "U00000002",
    name: "Bartek",
    status: "active",
    presence: "busy",
    unreadCount: 0,
  },
  {
    id: "3",
    slackUserId: "U00000003",
    name: "Kasia",
    status: "inactive",
    presence: "offline",
    unreadCount: 0,
  },
];
