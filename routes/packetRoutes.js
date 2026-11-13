const express = require("express");
const router = express.Router();

const Packet = require("../models/Packet");
const validatePacket = require("../validators/packetValidator");
const classifyProtocol = require("../automata/protocolDFA");

function identifyService(protocol, port) {
  if (protocol === "ICMP") return "ICMP";

  const services = {
    21: "FTP",
    22: "SSH",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    443: "HTTPS"
  };

  return services[Number(port)] || protocol;
}

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
    let {
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

    const normalizedProtocol = String(protocol || "").trim().toUpperCase();

    // Auto-validate and classify if not already determined
    if (isValid === undefined) {
      const validation = validatePacket(req.body);
      const dfaResult = classifyProtocol(normalizedProtocol);

      errors = [...validation.errors];
      if (!dfaResult.accepted) {
        errors.push("Unsupported protocol: " + (normalizedProtocol || "Empty"));
      }

      classification = dfaResult.accepted ? dfaResult.classification : "UNKNOWN";
      service = dfaResult.accepted ? identifyService(normalizedProtocol, destinationPort) : "UNKNOWN";
      isValid = errors.length === 0;
    }

    const packet = await Packet.create({
      sourceIP,
      destinationIP,
      protocol: normalizedProtocol,
      sourcePort,
      destinationPort,
      isValid: Boolean(isValid),
      classification: classification || "UNKNOWN",
      service: service || "UNKNOWN",
      errors: Array.isArray(errors) ? errors : []
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
