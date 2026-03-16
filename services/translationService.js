const translate = require("@vitalets/google-translate-api");

const translateToHindi = async (text) => {
  try {
    const result = await translate(text, { to: "hi" });
    return result.text;
  } catch (error) {
    console.error("Translation Error:", error.message);
    return text; // fallback to English
  }
};

module.exports = { translateToHindi };
