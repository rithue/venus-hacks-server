const https = require("https");
const fetch = require("node-fetch");

const ZIPCODE_URL = "https://www.zipcodeapi.com/rest/";
const ZIPCODE_KEY =
  "lgPfA4rtwypjiXUlGZCkBeqcjkEitH65fetoBvU0Bri3zQd1lVUu7qdFKu6eHwR9";
const CARBON_INTERFACE_URL = "https://www.carboninterface.com/api/v1/estimates";
const CARBON_INTERFACE_TOKEN = "wKeeJfodPXHcoYr3IOL04g";
const fuelTypes = {
  hybrid: "f9ff8de7-94a6-4a78-b70c-686dcbf720cc",
  electric: "ab91dfaf-004d-49e4-95d0-edd052eb44e1",
  gas: "7268a9b7-17e8-4c8d-acca-57059252afe9",
};

function getCarbonContent(startZipCode, endZipCode, fuelType, cb) {
  const distance = getDistance(startZipCode, endZipCode, function (response) {
    console.log("distance:", response.distance);
    getCarbonInterface(response.distance, fuelType, function (resp) {
      let result = {
        distance: response.distance,
        carbonEmission: resp.attributes.carbon_kg,
      };
      console.log("result:", result);
      cb(result);
    });
  });
}

function getDistance(startZipCode, endZipCode, cb) {
  https
    .get(
      ZIPCODE_URL +
        ZIPCODE_KEY +
        `/distance.json/${startZipCode}/${endZipCode}/mile`,
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            let json = JSON.parse(body);
            console.log("json:", json);
            console.log("json.distance:", json.distance);
            cb(json);
          } catch (error) {
            console.error(error.message);
          }
        });
      }
    )
    .on("error", (error) => {
      console.error(error.message);
    });
}

function getCarbonInterface(distance, fuelType, cb) {
  let bearer = "Bearer " + CARBON_INTERFACE_TOKEN;

  let requestPayload = {
    type: "vehicle",
    distance_unit: "mi",
    distance_value: distance,
    vehicle_model_id: fuelTypes[fuelType],
  };
  let settings = {
    method: "POST",
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestPayload),
  };

  fetch(CARBON_INTERFACE_URL, settings)
    .then((res) => res.json())
    .then((json) => {
      console.log("CI:", json);
      cb(json.data);
    });
}

exports.getCarbonContent = getCarbonContent;
