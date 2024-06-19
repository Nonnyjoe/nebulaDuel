type NavWithPath = {
  name: string;
  path: string;
};
type NavObject = {
  name: string;
  path?: string;
  dropdown?: NavWithPath[];
};

type NavArray = NavObject[];

export const NavLinks: NavArray = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "About Us",
    path: "/about",
  },
  {
    name: "Settings",
    dropdown: [
      { name: "Profile", path: "/profile" },
      { name: "Purchase Character", path: "/profile/purchasecharacter" },
      { name: "Your Characters", path: "/profile/yourcharacters" },
    ],
  },
  {
    name: "Contact Us",
    path: "/contact",
  },
];

type creatorObj = {
  title: string;
  createdBy: string;
  amount: string;
};

export const creators: creatorObj[] = [
  {
    title: "POKEMON DRAGON",
    createdBy: "0xblackadam",
    amount: "1.002",
  },
  {
    title: "POKEMON PRINCESS",
    createdBy: "Nonnyjoe",
    amount: "2.502",
  },
  {
    title: "POKEMON FIREFLY",
    createdBy: "Evans",
    amount: "4.200",
  },
];

// footer links

export const quickLinks: NavArray = [
  {
    name: "Gaming",
    path: "/",
  },
  {
    name: "Product",
    path: "/",
  },
  {
    name: "All NFTs",
    path: "/",
  },
  {
    name: "Social Network",
    path: "/",
  },
  {
    name: "Domain Names",
    path: "/",
  },
  {
    name: "Collectibles",
    path: "/",
  },
];

export const support: NavArray = [
  {
    name: "Setting & Privacy",
    path: "/",
  },
  {
    name: "Help & Support",
    path: "/",
  },
  {
    name: "Live Auction",
    path: "/",
  },
  {
    name: "Item Detail",
    path: "/",
  },
  {
    name: "24/7 Support",
    path: "/",
  },
  {
    name: "Our News",
    path: "/",
  },
];
