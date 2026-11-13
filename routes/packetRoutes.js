
const express = require("express");
const router = express.Router();

const Packet = require("../models/Packet");

// GET ALL PACKETS
router.get("/", async (req, res) => {
  try {
    const packets = await Packet.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packets.length,
      packets
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ADD PACKET
router.post("/", async (req, res) => {
  try {
    const {
      sourceIP,
      destinationIP,
      protocol,
      sourcePort,
      destinationPort,
      isValid,
      classification,
      service,
      errors
    } = req.body;

    const packet = await Packet.create({
      sourceIP,
      destinationIP,
      protocol,
      sourcePort,
      destinationPort,
      isValid,
      classification,
      service,
      errors
    });

    res.status(201).json({
      success: true,
      message: "Packet saved successfully",
      packet
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// SEARCH PACKETS
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";

    const packets = await Packet.find({
      $or: [
        { sourceIP: { $regex: q, $options: "i" } },
        { destinationIP: { $regex: q, $options: "i" } },
        { protocol: { $regex: q, $options: "i" } },
        { classification: { $regex: q, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: packets.length,
      packets
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE PACKET
router.delete("/:id", async (req, res) => {
  try {
    const packet = await Packet.findByIdAndDelete(req.params.id);

    if (!packet) {
      return res.status(404).json({
        success: false,
        message: "Packet not found"
      });
    }

    res.json({
      success: true,
      message: "Packet deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
