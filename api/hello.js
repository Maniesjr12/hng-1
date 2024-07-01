const axios = require("axios");

const IPINFO_TOKEN = "e4c0a2c2cfee86";

module.exports = async (req, res) => {
  const visitorName = req.query.visitor_name || "Guest";

  try {
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const locationResponse = await axios.get(
      `https://ipinfo.io/${clientIp}?token=${IPINFO_TOKEN}`
    );
    const locationData = locationResponse.data;

    if (!locationData.loc) {
      return res.status(400).json({ error: "Location data not available" });
    }

    const [latitude, longitude] = locationData.loc.split(",");

    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const temperature = weatherResponse.data.current_weather.temperature;

    const response = {
      client_ip: clientIp,
      location: locationData.city || "Unknown location",
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${
        locationData.city || "your location"
      }`,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
