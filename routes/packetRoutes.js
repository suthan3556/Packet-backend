
const express = require("express");

const router = express.Router();

const {
  createPacket,
  getPackets,
  getPacketById,
  deletePacket
} = require("../controllers/packetController");

// Create packet
router.post("/", createPacket);

// Get all packets
router.get("/", getPackets);

// Get packet by ID
router.get("/:id", getPacketById);

// Delete packet
router.delete("/:id", deletePacket);

module.exports = router;
