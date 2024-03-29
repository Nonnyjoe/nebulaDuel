
// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { FC } from "react";
import "./App.css";
import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import { useState, useEffect } from "react";
import WebFont from "webfontloader";
// import { BrowserRouter as Router, Routes, Route, Form } from "react-router-dom";
import {  createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from "react-router-dom";
import Home  from "./Home";
import Main from "./Main";
import Arena from "./Components/DynamicRoutes/Arena/Arena";
import {About} from "./About";
import Profile from "./Profile";
import CardDetails from "./Components/characters/CardDetails";
import ActiveDuels from "./Duels/ActiveDuels";
import { GraphQLProvider } from "./GraphQL";
import {ConnectedAddressProvider} from "./ConnectedAddressContext";



import { Network } from "./Network";
import configFile from "./config.json";
import SelectStrategy from "./Components/selectStrategy/selectStrategy";
import SelectWarriors from "./Components/selectWarriors/selectWarriors";
import Duels from "./Duels/duels";
import SelectWarriorsDynamic from "./Components/DynamicRoutes/selectWarriors/selectWarriors";
import SelectStrategyDynamic from "./Components/DynamicRoutes/selectStrategy/selectStrategy";


import ProfileForm from './Components/profileForm/Profileform';
import Cards from "./Components/characters/Cards";
import PurchaseCharacter from './Components/purchaseCharacter/purchaseCharacter';


const router = createBrowserRouter(createRoutesFromElements(
  <Route>
    {/* <Route path="/" element={<Home />} /> */}
    {/* <Route path="/home" element={<Home />} /> */}
    <Route path="/" element={<Main />} />
    <Route path="/main" element={<Main />} />
    <Route path="/arena/:duelId" element={<Arena />} />
    <Route path="/about" element={<About />} />
    <Route element={<Profile />} >
      <Route index path="/profile" element={<ProfileForm />} />
      <Route index path="/purchasecharacter" element={<PurchaseCharacter />} />
      <Route index path="/yourcharacters" element={<Cards />} />
    </Route>
    <Route path='/:profileId' element={<CardDetails />} /> 
    <Route path='/selectStrategy' element={<SelectStrategy />} /> 
    <Route path='/selectWarriors' element={<SelectWarriors />} /> 
    <Route path="/duels" element={<ActiveDuels />}/>
    <Route path="/duels/:duelId" element={<SelectWarriorsDynamic />}/>
    <Route path="/setStrategy/:duelId" element={<SelectStrategyDynamic />}/>
    
    {/* <Route path="/duels" element={<ActiveDuels />}/>
    <Route path="duels/:duelId" element={<Duels/>}/> */}
    
  </Route>
))


const config: any = configFile;

const injected: any = injectedModule();
init({
    wallets: [injected],
    chains: Object.entries(config).map(([k, v]: [string, any], i) => ({id: k, token: v.token, label: v.label, rpcUrl: v.rpcUrl})),
    appMetadata: {
        name: "Nebula Duel",
        icon: "<svg><svg/>",
        description: "Demo app for Nebula Duel",
        recommendedInjectedWallets: [
            { name: "MetaMask", url: "https://metamask.io" },
        ],
    },
});


const App: FC = () => {
    const [dappAddress, setDappAddress] = useState<string>("0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C");
    useEffect(() => {
        WebFont.load({
          google: {
            families: ["Tilt Neon", "Roboto", "Droid Sans", "Chilanka"],
          },
        });
      }, []);

    return (
      <ConnectedAddressProvider>
      <div className="App">
        <RouterProvider router={router} />
     </div>
      </ConnectedAddressProvider>
    );
};

export default App;
