import { useQuery, gql } from '@apollo/client';
import { useEffect } from "react";
import { ethers } from 'ethers';

// GraphQL query to retrieve notice
const GET_LATEST_NOTICE = gql`
  query latestNotice {
    notices(first: 1) {
      edges {
        node {
          payload
        }
      }
    }
  }
`;

function RenderNotices({onNoticeGenerated}) {
    // Execute the GraphQL query to fetch the latest notice
    const { loading, error, data } = useQuery(GET_LATEST_NOTICE, {pollInterval: 500});

    useEffect(() => {
        if (loading) {
          console.log("Loading notices");
        }
        if (error) {
          console.error(`Error querying Query Server: ${JSON.stringify(error)}`);
        }
    
        if (data) {
          const latestNotice = data.notices.edges[0];
    
          if (latestNotice) {
            const noticePayload = ethers.utils.toUtf8String(latestNotice.node.payload);
            console.log(`Latest notice payload: ${noticePayload}`);
            onNoticeGenerated(noticePayload); // Call the callback function to send notice back to parent component - App
          }
        }
      }, [data, onNoticeGenerated]);
    return null
}

export default RenderNotices;
