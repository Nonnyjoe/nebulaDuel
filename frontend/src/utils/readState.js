import axios from 'axios';
import {hexToString} from 'viem';


async function readGameState(data) {
    console.log("forwarding transaction to relayer........")
    try {
        const response = await axios.get( `https://nebuladuel.fly.dev/inspect/${data}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Transaction successful:', response.data);
        const {Status, request_payload} = destructureResponse(response.data.reports, data);
        // console.log(Status, request_payload);
        return {Status, request_payload};
    } catch (error) {
        console.error('Error sending transaction:', error.response ? error.response.data : error.message);
        return {Status: false, request_payload: error.message};
    }
}



function destructureResponse(reports, data) {
    if (data.includes("/")) {
        console.log("returning a single response");
        // console.log(reports[0].payload);
        let payload = hexToString(reports[0].payload);
        payload = JSON.parse(`{${payload}`);
        return {Status: true, request_payload: payload};

    } else {

        // console.log(reports[0].payload);
        let payload = hexToArray(reports[0].payload);
        return {Status: true, request_payload: payload};
    }


}


function hexToArray(hexString) {
    const jsonString = `[${hexToString(hexString)}`;
    // console.log(jsonString);
    const data = JSON.parse(jsonString); 
    return data;
}


export default readGameState;