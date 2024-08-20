export type Voucher = {
  index: number;
  payload: string;
  destination: string;
  proof: any;
};

export async function fetchVouchers() {
  // const url = 'https://nebuladuel.fly.dev/graphql';
  const url = "http://localhost:8080/graphql";
  const query = `
        query vouchers {
        vouchers {
            edges {
            node {
                index
                input {
                index
                }
                destination
                payload
                proof {
                validity {
                    inputIndexWithinEpoch
                    outputIndexWithinInput
                    outputHashesRootHash
                    vouchersEpochRootHash
                    noticesEpochRootHash
                    machineStateHash
                    outputHashInOutputHashesSiblings
                    outputHashesInEpochSiblings
                    
                }
                context
                }
            }
            }
        }
        }
    `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    const vouchers = responseData?.data.vouchers.edges;

    const all_Vouchers: Voucher[] = [];

    for (let i = 0; i < vouchers.length; i++) {
      const index = vouchers[i].node.index;
      const payload = vouchers[i].node.payload;
      const destination = vouchers[i].node.destination;
      const proof = vouchers[i].node.proof;

      all_Vouchers.push({
        index: index,
        payload: payload,
        destination: destination,
        proof: proof,
      });
    }
    return all_Vouchers;
  } catch (error) {
    console.error("Error fetching notices:", error);
  }
}
