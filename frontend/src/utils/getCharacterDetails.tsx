import React, { useState, useEffect } from "react";
// import { BsFillCaretRightFill, BsFillCaretLeftFill } from "react-icons/bs";
// import { Input } from "../../Input";
import { Input } from "./input";
// import { useRollups } from "../../useRollups";
import { ethers } from "ethers";
// import RenderNotices from "../../utils/RenderNotices";
// import { Notices } from "../../Notices";
// import { useConnectedAddress } from "../../ConnectedAddressContext";

async function fetchCharacterNotices(characterId: any) {
  if (characterId) {
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query:
            "query { notices(last: 30 ) { totalCount, edges{ node{ index, payload, } } } }",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      let data = await response.json();
      data = data.data.notices.edges;
      // console.log('Data from GraphQL:', data);
      let JsonResponse = extractPayloadValues(data);
      let latestProfiles = getObjectWithHighestId(
        JsonResponse,
        "all_character"
      );
      console.log("latestProfiles", latestProfiles);

      if (latestProfiles === null) {
        //   setCharacterSatate(null);
        return null;
      }

      // setCharacterSatate(latestProfiles);
      // setAllProfiles(latestProfiles.data);
      let userData = extractUserDetails(latestProfiles.data, characterId);
      console.log(`JsonResponse is:`, userData);
      return userData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

// Function to extract the payload and convert it to a json object
function extractPayloadValues(arrayOfObjects: any) {
  let payloadValues = [];
  for (let obj of arrayOfObjects) {
    if ("node" in obj) {
      payloadValues.push(JSON.parse(handleNoticeGenerated(obj.node.payload)));
    }
  }
  // Return the array of payload values
  return payloadValues;
}

// Function that collects an array of objects, then gets the object with the same method and the highest Id number.
function getObjectWithHighestId(objects: any[], methodName: string) {
  let filteredObjects = objects.filter(
    (obj) => obj.method === String(methodName)
  ); // Filter objects with the specified method name
  if (filteredObjects.length === 0) return null; // If no objects match the method name, return null

  let highestIdObject = filteredObjects[0]; // Initialize with the first object
  for (let obj of filteredObjects) {
    if (obj.txId > highestIdObject.txId) {
      // Check if current object has a higher id
      highestIdObject = obj;
    }
  }
  return highestIdObject; // Return the object with the highest id
}

function extractUserDetails(arrayOfData: any[], characterId: any) {
  console.log("AlluserDetails", arrayOfData);
  // console.log("test", String(arrayOfData[1].owner) === String(connectedAddress));

  let filteredData = arrayOfData.filter(
    (data) => parseInt(data.id) === parseInt(characterId)
  );
  console.log("userDetails", filteredData);
  if (filteredData.length === 0) {
    //   setUserData(null);
    return null; // If no objects match the method name, return null
  }
  // setUserData(filteredData);
  return filteredData;
}

// Callback function to update noticeGenerated
const handleNoticeGenerated = (noticePayload: any) => {
  let data = ethers.utils.toUtf8String(noticePayload);
  // setNoticeGenerated(true)
  return data;
};

export default async function getCharacterDetails(characterID: any) {
//   console.log("attempting to fetch data.......", characterID);
  let userStruct: any = await fetchCharacterNotices(characterID);
//   console.log("userProfileDetails", "userStruct");
  return userStruct[0] ? userStruct[0] : userStruct;
  // return 2;
}
