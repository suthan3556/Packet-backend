
const Packet = require("../models/Packet");
const validatePacket = require("../validators/packetValidator");
const classifyProtocol = require("../automata/protocolDFA");

// Identify common services using destination port
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

// Create and validate packet
exports.createPacket = async (req, res) => {
  try {
    const {
      sourceIP,
      destinationIP,
      protocol,
      sourcePort,
      destinationPort
    } = req.body;

    // Regex and field validation
    const validation = validatePacket(req.body);

    // DFA classification
    const dfaResult = classifyProtocol(protocol);

    const errors = [...validation.errors];

    if (!dfaResult.accepted) {
      errors.push("Unsupported protocol: " + (protocol || "Empty"));
    }

    const normalizedProtocol = String(protocol || "")
      .trim()
      .toUpperCase();

    const classification = dfaResult.accepted
      ? dfaResult.classification
      : "UNKNOWN";

    const service = dfaResult.accepted
      ? identifyService(normalizedProtocol, destinationPort)
      : "UNKNOWN";

    const packet = await Packet.create({
      sourceIP,
      destinationIP,
      protocol: normalizedProtocol,
      sourcePort,
      destinationPort,
      isValid: errors.length === 0,
      classification,
      service,
      errors
    });

    res.status(201).json({
      message: "Packet processed successfully",
      packet
    });

  } catch (error) {
    res.status(500).json({
      message: "Packet processing failed",
      error: error.message
    });
  }
};

// Get all packets
exports.getPackets = async (req, res) => {
  try {
    const packets = await Packet.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: packets.length,
      packets
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get single packet
exports.getPacketById = async (req, res) => {
  try {
    const packet = await Packet.findById(req.params.id);

    if (!packet) {
      return res.status(404).json({
        message: "Packet not found"
      });
    }

    res.status(200).json(packet);

  } catch (error) {
    res.status(400).json({
      message: "Invalid packet ID"
    });
  }
};

// Delete packet
exports.deletePacket = async (req, res) => {
  try {
    const packet = await Packet.findByIdAndDelete(req.params.id);

    if (!packet) {
      return res.status(404).json({
        message: "Packet not found"
      });
    }

    res.status(200).json({
      message: "Packet deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};
