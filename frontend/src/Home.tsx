import { FC } from "react";
import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import { useState } from "react";

import { GraphQLProvider } from "./GraphQL";
import { Notices } from "./Notices";
import { Input } from "./Input";
import { Inspect } from "./Inspect";
import { Network } from "./Network";
import { Vouchers } from "./Vouchers";
import { Reports } from "./Reports";
import configFile from "./config.json";

const config: any = configFile;

const injected: any = injectedModule();
init({
    wallets: [injected],
    chains: Object.entries(config).map(([k, v]: [string, any], i) => ({id: k, token: v.token, label: v.label, rpcUrl: v.rpcUrl})),
    appMetadata: {
        name: "Cartesi Rollups Test DApp",
        icon: "<svg><svg/>",
        description: "Demo app for Cartesi Rollups",
        recommendedInjectedWallets: [
            { name: "MetaMask", url: "https://metamask.io" },
        ],
    },
});

const Home: FC = () => {
    const [dappAddress, setDappAddress] = useState<string>("0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C");

    return (
        <div>

            <p>Cartesi Rollups Test DApp</p>

             {/* <Network /> */}
            <GraphQLProvider>
                <div>
                    Dapp Address: <input
                        type="text"
                        value={dappAddress}
                        onChange={(e) => setDappAddress(e.target.value)}
                    />
                    <br /><br />
                </div>
                <h2>Inspect</h2>
                <Inspect />
                <h2>Input</h2>
                <Input dappAddress={dappAddress}  input={"hello"} hexInput={false}/>
                <h2>Reports</h2>
                <Reports />
                <h2>Notices</h2>
                <Notices />
                <h2>Vouchers</h2>
                <Vouchers dappAddress={dappAddress} />
            </GraphQLProvider>

        </div>
    );
};

export default Home;