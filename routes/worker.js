const https = require('https');

const ZIPCODE_URL = "https://www.zipcodeapi.com/rest/"
const ZIPCODE_KEY = "lgPfA4rtwypjiXUlGZCkBeqcjkEitH65fetoBvU0Bri3zQd1lVUu7qdFKu6eHwR9"


function getCarbonContent(startZipCode,endZipCode,cb) {
    console.log(startZipCode+' '+endZipCode)
    https.get(ZIPCODE_URL+ZIPCODE_KEY+`/distance.json/${startZipCode}/${endZipCode}/mile`,res => {
        console.log(res)
    })
}

exports.getCarbonContent = getCarbonContent;