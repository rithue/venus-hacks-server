const https = require("https");
const fetch = require("node-fetch");
const mcache = require("memory-cache");

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
        carbonEmission: resp,
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
  let cachedData = mcache.get(distance);
  if (cachedData) {
    console.log("loaded from cache:", cachedData);
    cb(cachedData);
    return;
  }
  let bearer = "Bearer " + CARBON_INTERFACE_TOKEN;

  let settingsGas = {
    method: "POST",
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "vehicle",
      distance_unit: "mi",
      distance_value: distance,
      vehicle_model_id: fuelTypes["gas"],
    }),
  };

  let settingsHybrid = {
    method: "POST",
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "vehicle",
      distance_unit: "mi",
      distance_value: distance,
      vehicle_model_id: fuelTypes["hybrid"],
    }),
  };

  let settingsElectric = {
    method: "POST",
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "vehicle",
      distance_unit: "mi",
      distance_value: distance,
      vehicle_model_id: fuelTypes["electric"],
    }),
  };

  Promise.all([
    fetch(CARBON_INTERFACE_URL, settingsGas),
    fetch(CARBON_INTERFACE_URL, settingsHybrid),
    fetch(CARBON_INTERFACE_URL, settingsElectric),
  ])
    .then(function (responses) {
      // Get a JSON object from each of the responses
      return Promise.all(
        responses.map(function (response) {
          return response.json();
        })
      );
    })
    .then(function (data) {
      let result = {};
      data.forEach((resp, idx) => {
        const { data } = resp;
        if (
          data.attributes.vehicle_model_id ===
          "f9ff8de7-94a6-4a78-b70c-686dcbf720cc"
        ) {
          result["hybrid_kg"] = data.attributes.carbon_kg;
          result["hybrid_lb"] = data.attributes.carbon_lb;
        } else if (
          data.attributes.vehicle_model_id ===
          "ab91dfaf-004d-49e4-95d0-edd052eb44e1"
        ) {
          result["electric_kg"] = data.attributes.carbon_kg;
          result["electric_lb"] = data.attributes.carbon_lb;
        } else {
          result["gas_kg"] = data.attributes.carbon_kg;
          result["gas_lb"] = data.attributes.carbon_lb;
        }
      });
      console.log("result:", result);
      mcache.put(distance, result, 86400);
      cb(result);
    })
    .catch(function (error) {
      // if there's an error, log it
      console.log(error);
    });

  //   fetch(CARBON_INTERFACE_URL, settings)
  //     .then((res) => res.json())
  //     .then((json) => {
  //       console.log("CI:", json);
  //       mcache.put(distance, json.data, 86400);
  //       cb(json.data);
  //     });
}

exports.getCarbonContent = getCarbonContent;