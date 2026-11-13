const mongoose = require("mongoose");

const packetSchema = new mongoose.Schema(
  {
    sourceIP: {
      type: String,
      required: true,
      trim: true
    },

    destinationIP: {
      type: String,
      required: true,
      trim: true
    },

    protocol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    sourcePort: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    destinationPort: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    isValid: {
      type: Boolean,
      default: false
    },

    classification: {
      type: String,
      default: "UNKNOWN"
    },

    service: {
      type: String,
      default: "UNKNOWN"
    },

    errors: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true
  }
);

module.exports =
  mongoose.models.Packet ||
  mongoose.model("Packet", packetSchema);
