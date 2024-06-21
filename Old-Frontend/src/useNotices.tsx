import { useQuery } from "@apollo/client";
import { ethers } from "ethers";
import { gql } from "urql";

export type TNotice = {
  id: string;
  index: number;
  input: any;
  payload: string;
};

export const GET_NOTICES = gql`
    query GetNotices {
        notices(last: 30 {
            totalCount
            edges {
                node {
                    index
                    payload
                }
            }
        }
    }
`;

export const useNotices = () => {
   const { loading, error, data } = useQuery(GET_NOTICES, {
    pollInterval: 500
   });    

   const notices: TNotice[] = data?.notices.edges
    .map((node: any) => {
      const n = node.node;
      let inputPayload = n?.input.payload;
      if (inputPayload) {
        try {
          inputPayload = ethers.utils.toUtf8String(inputPayload);
        } catch (e) {
          inputPayload = inputPayload + " (hex)";
        }
      } else {
        inputPayload = "(empty)";
      }
      let payload = n?.payload;
      if (payload) {
        try {
          payload = ethers.utils.toUtf8String(payload);
        } catch (e) {
          payload = payload + " (hex)";
        }
      } else {
        payload = "(empty)";
      }
      return {
        id: `${n?.id}`,
        index: parseInt(n?.index),
        payload: `${payload}`,
        input: n ? { index: n.input.index, payload: inputPayload } : {},
      };
    })
    .sort((b: any, a: any) => {
      if (a.input.index === b.input.index) {
        return b.index - a.index;
      } else {
        return b.input.index - a.input.index;
      }
    });

  return { loading, error, data, notices };
};


