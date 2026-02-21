const axios = require("axios");

const getKundli = async (req, res) => {
  try {
    const {
      name,
      gender,
      lang,
      day,
      month,
      year,
      lat,
      lon,
    } = req.query;

    // Required validation
    if (!name || !gender || !day || !month || !year || !lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters",
      });
    }

    const response = await axios.get(
      "https://astro.trisama.cloud/api/kundli",
      {
        params: {
          name,
          gender,
          lang: lang || "en",
          day,
          month,
          year,
          lat,
          lon,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("Astro API Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch kundli data",
      error: error.response?.data || error.message,
    });
  }
};




const getHoroscope = async (req, res) => {
  try {
    const {
      name,
      day,
      month,
      year,
      hour,
      minute,
      lat,
      lon,
      lang,
    } = req.query;

    // Validate required params
    if (!name || !day || !month || !year || !hour || !minute || !lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters",
      });
    }

    const response = await axios.get(
      "https://astro.trisama.cloud/api/horoscope",
      {
        params: {
          name,
          day,
          month,
          year,
          hour,
          minute,
          lat,
          lon,
          lang: lang || "en",
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("Horoscope API Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch horoscope data",
      error: error.response?.data || error.message,
    });
  }
};




const getKundliMatch = async (req, res) => {
  try {
    const {
      boy_name,
      boy_day,
      boy_month,
      boy_year,
      boy_hour,
      boy_minute,
      boy_lat,
      boy_lon,
      girl_name,
      girl_day,
      girl_month,
      girl_year,
      girl_hour,
      girl_minute,
      girl_lat,
      girl_lon,
      lang,
    } = req.query;

    // Validate required parameters
    if (
      !boy_name || !boy_day || !boy_month || !boy_year ||
      !boy_hour || !boy_minute || !boy_lat || !boy_lon ||
      !girl_name || !girl_day || !girl_month || !girl_year ||
      !girl_hour || !girl_minute || !girl_lat || !girl_lon
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters",
      });
    }

    const response = await axios.get(
      "https://astro.trisama.cloud/api/kundli/match",
      {
        params: {
          boy_name,
          boy_day,
          boy_month,
          boy_year,
          boy_hour,
          boy_minute,
          boy_lat,
          boy_lon,
          girl_name,
          girl_day,
          girl_month,
          girl_year,
          girl_hour,
          girl_minute,
          girl_lat,
          girl_lon,
          lang: lang || "en",
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("Kundli Match API Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch kundli match data",
      error: error.response?.data || error.message,
    });
  }
};


module.exports = {
  getKundli,
  getHoroscope,
  getKundliMatch,
};