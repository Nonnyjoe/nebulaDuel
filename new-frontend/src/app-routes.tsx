import { lazy, type ComponentType } from "react";

export interface AppRoute {
  path: string;
  Component: ComponentType;
}

// Page components (each default-exports its component after the React-Router conversion).
const Home = lazy(() => import("./routes/index"));
const Campaign = lazy(() => import("./routes/campaign"));
const Duels = lazy(() => import("./routes/duels"));
const CreateDuel = lazy(() => import("./routes/create-duel"));
const Battle = lazy(() => import("./routes/battle"));
const Replay = lazy(() => import("./routes/replay"));
const Results = lazy(() => import("./routes/results"));
const Market = lazy(() => import("./routes/market"));
const Profile = lazy(() => import("./routes/profile"));
const Leaderboard = lazy(() => import("./routes/leaderboard"));
const Codex = lazy(() => import("./routes/codex"));
const WarriorDetail = lazy(() => import("./routes/warrior.$id"));
const Wallet = lazy(() => import("./routes/wallet"));
const JoinDuel = lazy(() => import("./routes/join.$duelId"));
const Admin = lazy(() => import("./routes/admin"));

export const appRoutes: AppRoute[] = [
  { path: "/", Component: Home },
  { path: "/campaign", Component: Campaign },
  { path: "/duels", Component: Duels },
  { path: "/create-duel", Component: CreateDuel },
  { path: "/battle", Component: Battle },
  { path: "/replay", Component: Replay },
  { path: "/results", Component: Results },
  { path: "/market", Component: Market },
  { path: "/profile", Component: Profile },
  { path: "/leaderboard", Component: Leaderboard },
  { path: "/codex", Component: Codex },
  { path: "/warrior/:id", Component: WarriorDetail },
  { path: "/wallet", Component: Wallet },
  { path: "/join/:duelId", Component: JoinDuel },
  { path: "/admin", Component: Admin },
];
