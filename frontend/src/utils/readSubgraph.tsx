import {hexToString} from 'viem';
// import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// Initialize Apollo Client
async function fetchNotices(request: string) {
    const url = 'https://nebuladuel.fly.dev/graphql';
    const query = `
      query notices {
        notices {
          edges {
            node {
              index
              input {
                index
              }
              payload
            }
          }
        }
      }
    `;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          variables: {},
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const responseData = await (response.json());
      const notices = responseData?.data.notices.edges;
      
      const specific_tx = [];
      const all_tx = [];

      for (let i = 0; i < notices.length; i++) {
        const tx = JSON.parse(`{${hexToString(notices[i].node.payload as `0x${string}`)}`)
        if (tx.notice_type == "specific_tx") {
            specific_tx.push(tx);
            // console.log(tx.method, tx.tx_id, JSON.parse(tx.data));
        } else {
            all_tx.push(tx);
            // console.log(tx.method, tx.tx_id, JSON.parse(tx.data));
        }
      }

      if (request == "all_profiles") {
        return fetch_profiles(specific_tx);
      } else if (request == "all_characters") {
        return fetch_characters(specific_tx);
      } else if (request == "all_duels") {
        return fetch_duels(specific_tx);
      } else if (request == "all_tx") {
        return fetch_all_tx(all_tx);
      } else if (request == "ai_duels") {
        return fetch_ai_duels(specific_tx);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  }
  

function fetch_profiles(specific_tx: any) {
    const player_profiles = specific_tx.filter((tx: any) => tx.method == "create_player");
    let highest_id;
    for (let i = 0; i < player_profiles.length; i++) {
        highest_id = player_profiles[i];
        if (player_profiles[i].tx_id > highest_id) {
            highest_id = player_profiles[i].tx_id;
        }
    }
    // console.log("All Player Profiles: ", JSON.parse(highest_id?.data));
    return highest_id.data ? JSON.parse(highest_id.data) : [];
}

function fetch_characters(specific_tx: any) {
    // console.log(specific_tx);
    const all_characters = specific_tx.filter((tx: any) => tx.method == "purchase_team");
    let highest_id;
    for (let i = 0; i < all_characters.length; i++) {
        highest_id = all_characters[i];
        if (all_characters[i].tx_id > highest_id) {
            highest_id = all_characters[i].tx_id;
        }
    }
    // console.log("All Player Characters: ", JSON.parse(highest_id?.data));
    return highest_id?.data ?  JSON.parse(highest_id?.data): [ ];
}

function fetch_duels(specific_tx: any) {
    console.log(specific_tx);
    const all_duels = specific_tx.filter((tx: any) => tx.method == 'create_duel');
    console.log("all duels are:", all_duels)
    let highest_id;
    for (let i = 0; i < all_duels.length; i++) {
        highest_id = all_duels[i];
        if (all_duels[i].tx_id > highest_id) {
            highest_id = all_duels[i].tx_id;
        }
    }
    // console.log("All Player Characters: ", JSON.parse(highest_id));
    // console.log("All Player Characters: ", (highest_id));
    return highest_id?.data ?  JSON.parse(highest_id?.data): [ ];
}

function fetch_ai_duels(specific_tx: any) {
    console.log(specific_tx);
    const all_duels = specific_tx.filter((tx: any) => tx.method == 'create_ai_duel');
    console.log("all duels are:", all_duels)
    let highest_id;
    for (let i = 0; i < all_duels.length; i++) {
        highest_id = all_duels[i];
        if (all_duels[i].tx_id > highest_id) {
            highest_id = all_duels[i].tx_id;
        }
    }
    // console.log("All Player Characters: ", JSON.parse(highest_id));
    // console.log("All Player Characters: ", (highest_id));
    return highest_id?.data ?  JSON.parse(highest_id?.data) : [];
}

function fetch_all_tx(all_tx: any) {
    console.log(all_tx);
    let highest_id;
    for (let i = 0; i < all_tx.length; i++) {
        highest_id = all_tx[i];
        if (all_tx[i].tx_id > highest_id) {
            highest_id = all_tx[i].tx_id;
        }
    }
    // console.log("All Player Characters: ", JSON.parse(highest_id?.data));
    // console.log("All Player Characters: ", (highest_id));
    return highest_id?.data ? JSON.parse(highest_id?.data) : [];
}





export default fetchNotices;
  