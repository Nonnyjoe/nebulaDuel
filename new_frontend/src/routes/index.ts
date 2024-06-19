import { lazy } from "react";

const Home = lazy(() => import("../pages/index"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const Profile = lazy(() => import("../pages/Profile"));
const Purchase = lazy(() => import("../pages/Purchase"));
const Characters = lazy(() => import("../pages/Characters"));
const Arena = lazy(() => import("../pages/Arena"));
const Strategy = lazy(() => import("../pages/Strategy"));
const WarriorsSelection = lazy(() => import("../pages/Warriors"));

type Route = {
  path: string;
  title: string;
  component: React.LazyExoticComponent<() => JSX.Element>;
};
type coreRoutes = Route[];

const coreRoutes: coreRoutes = [
  {
    path: "/",
    title: "Home",
    component: Home,
  },
  {
    path: "/about",
    title: "About",
    component: About,
  },
  {
    path: "/contact",
    title: "Contact",
    component: Contact,
  },
  {
    path: "/profile",
    title: "Profile",
    component: Profile,
  },
  {
    path: "/profile/purchasecharacter",
    title: "Purchase Character",
    component: Purchase,
  },
  {
    path: "/profile/yourcharacters",
    title: "Your Characters",
    component: Characters,
  },
  {
    path: "/arena",
    title: "Arena",
    component: Arena,
  },
  {
    path: "/strategy",
    title: "Strategy",
    component: Strategy,
  },
  {
    path: "/selectWarriors",
    title: "Warriors",
    component: WarriorsSelection,
  },
];

const routes = [...coreRoutes];
export default routes;
