const axios = require("axios");
const { getAccessToken } = require("../services/prokeralaService");
const { translateToHindi } = require("../services/translationService");

// 🔮 Get Advanced Panchang
const getPanchang = async (req, res) => {
  try {
    const token = await getAccessToken();

    const {
      datetime,
      latitude,
      longitude,
      ayanamsa = 1,
      language = "en"
    } = req.body;

    const response = await axios.get(
      "https://api.prokerala.com/v2/astrology/panchang/advanced",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          datetime: datetime, // "2026-02-18T09:00:00+05:30"
          coordinates: `${latitude},${longitude}`,
          ayanamsa: ayanamsa,
          la: language, // en or hi
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Panchang API Error:", error.response?.data);
    res.status(500).json({
      error: error.response?.data || "Something went wrong",
    });
  }
};

const getDailyHoroscope = async (req, res) => {
  try {
    const token = await getAccessToken();

    const {
      sign,
      date,
      type = "all",
      language = "en"
    } = req.body;

    const datetime = `${date}T00:00:00+05:30`;

    // Always fetch in English
    const response = await axios.get(
      "https://api.prokerala.com/v2/horoscope/daily/advanced",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sign,
          datetime,
          type,
          la: "en"
        },
      }
    );

    let data = response.data;

    // If Hindi requested → translate main text fields
    if (language === "hi") {

      if (data?.data?.prediction) {
        data.data.prediction =
          await translateToHindi(data.data.prediction);
      }

      if (data?.data?.love) {
        data.data.love =
          await translateToHindi(data.data.love);
      }

      if (data?.data?.health) {
        data.data.health =
          await translateToHindi(data.data.health);
      }

      if (data?.data?.career) {
        data.data.career =
          await translateToHindi(data.data.career);
      }
    }

    res.json({
      language_used: language,
      data
    });

  } catch (error) {
    console.error("Daily Horoscope Error:", error.response?.data);
    res.status(500).json({
      error: error.response?.data || "Something went wrong",
    });
  }
};




const getKundliMatching = async (req, res) => {
  try {
    const token = await getAccessToken();

    const {
      ayanamsa = 1,
      girl_coordinates,
      girl_dob,
      boy_coordinates,
      boy_dob,
      language = "en"
    } = req.body;

    if (!girl_coordinates || !girl_dob || !boy_coordinates || !boy_dob) {
      return res.status(400).json({
        error: "Missing required parameters",
      });
    }

    const response = await axios.get(
      "https://api.prokerala.com/v2/astrology/kundli-matching/advanced",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ayanamsa,
          girl_coordinates,
          girl_dob,
          boy_coordinates,
          boy_dob,
          la: language // en or hi
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("Kundli Matching API Error:", error.response?.data);

    res.status(500).json({
      error: error.response?.data || "Something went wrong",
    });
  }
};




const getKundli = async (req, res) => {
  try {
    const token = await getAccessToken();

    const {
      ayanamsa = 1,
      latitude,
      longitude,
      datetime,
      language = "en",
      year_length = 1,
      chart_type = "rasi",
      chart_style = "north-indian",
      format = "svg",
      upagraha_position = "middle"
    } = req.body;

    if (!latitude || !longitude || !datetime) {
      return res.status(400).json({
        error: "latitude, longitude and datetime are required"
      });
    }

    // ✅ Kundli (Birth Chart) API
    const kundliResponse = await axios.get(
      "https://api.prokerala.com/v2/astrology/kundli/advanced",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ayanamsa,
          coordinates: `${latitude},${longitude}`,
          datetime: datetime,
          la: language,
          year_length
        },
      }
    );

    // ✅ Chart API
    const chartResponse = await axios.get(
      "https://api.prokerala.com/v2/astrology/chart",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ayanamsa,
          coordinates: `${latitude},${longitude}`,
          datetime: datetime,
          chart_type,
          chart_style,
          format,
          la: language,
          upagraha_position
        }
      }
    );

    // Combine both responses
    res.json({
      kundli: kundliResponse.data,
      chart: chartResponse.data
    });

  } catch (error) {
    console.error("Kundli + Chart API Error:", error.response?.data);

    res.status(500).json({
      error: error.response?.data || "Something went wrong",
    });
  }
};












module.exports = { getPanchang, getDailyHoroscope, getKundliMatching,getKundli };
