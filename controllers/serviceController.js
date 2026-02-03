const Service = require("../models/serviceModel");

exports.getServices = async (req, res) => {
  try {
    const services = await Service.getAllActive();
    res.json({
      success: true,
      data: services,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createService = async (req, res) => {
  try {
    const { title, icon } = req.body;

    if (!title || !icon) {
      return res.status(400).json({
        success: false,
        message: "Title and icon required",
      });
    }

    const service = await Service.create({ title, icon });

    res.status(201).json({
      success: true,
      data: service[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.update(id, req.body);

    res.json({
      success: true,
      data: service[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.delete(id);

    res.json({
      success: true,
      message: "Service deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
