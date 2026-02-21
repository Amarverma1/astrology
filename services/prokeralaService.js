const axios = require("axios");

const CLIENT_ID = process.env.PROKERALA_CLIENT_ID;
const CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  try {
    if (accessToken && tokenExpiry > Date.now()) {
      return accessToken;
    }

    const response = await axios.post(
      "https://api.prokerala.com/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;

    return accessToken;
  } catch (error) {
    console.error("Token Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getAccessToken };
