import {
  product1,
  product2,
  product3,
  product4,
  product5,
  product6,
  product7,
  product8,
  product9,
} from "../../assets/products";

export type ProductType = {
  id: number;
  name: string;
  category: string;
  price: number;
  isInStock: boolean;
  img: string;
  briefDesc: string;
  model: string[];
  itemCategories: string[];
  tags: string[];
  desc: string;
  rates: number;
  additionalInfo: {
    general: string;
    technicalInfo: string;
    display: string;
    ramAndStorage: string;
    included: string;
  };
  reviews: string[];
};

export const ListOfProducts: ProductType[] = [
  {
    id: 1,
    name: "NINTENDO SWITCH",
    category: "NEBULA DUEL",
    price: 29,
    isInStock: true,
    img: product1,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
  {
    id: 2,
    name: "HEADPHONE",
    category: "NEBULA DUEL",
    price: 69,
    isInStock: true,
    img: product2,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
  {
    id: 3,
    name: "REPLICA AXE",
    category: "P2P",
    price: 39,
    isInStock: false,
    img: product3,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
  {
    id: 4,
    name: "PS5 CONTROLLER",
    category: "P2P",
    price: 49,
    isInStock: true,
    img: product4,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
  {
    id: 5,
    name: "GOLDEN CROWN",
    category: "P2P",
    price: 19,
    isInStock: true,
    img: product5,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
  {
    id: 6,
    name: "GAMING MOUSE",
    category: "NEBULA DUEL",
    price: 30,
    isInStock: false,
    img: product6,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
  {
    id: 7,
    name: "HEADPHONE - X",
    category: "NEBULA DUEL",
    price: 25,
    isInStock: true,
    img: product7,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
  {
    id: 8,
    name: "REPLICA GUN",
    category: "P2P",
    price: 55,
    isInStock: true,
    img: product8,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
  {
    id: 9,
    name: "GUN ROBOT",
    category: "P2P",
    price: 109,
    isInStock: true,
    img: product9,
    briefDesc:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    model: ["Gat", "Dat4", "Rt30"],
    itemCategories: ["Gamdias", "Apple", "Huawei"],
    tags: ["Silver", "Pink", "Green"],
    desc: "Don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.",
    rates: 5,
    additionalInfo: {
      general: "PS5 Digital Platform",
      technicalInfo: "Qualcomm Snapdragon XR2",
      display: "3664 x 1920",
      ramAndStorage: "8GB/256GB",
      included: "PS5 VR Streaming Assistant",
    },
    reviews: [],
  },
];
