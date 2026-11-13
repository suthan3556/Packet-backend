
const mongoose = require("mongoose");

const packetSchema = new mongoose.Schema(
  {
    sourceIP: {
      type: String,
      default: ""
    },

    destinationIP: {
      type: String,
      default: ""
    },

    protocol: {
      type: String,
      default: ""
    },

    sourcePort: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    service: {
  type: String,
  default: "UNKNOWN"
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

    errors: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Packet ||
  mongoose.model("Packet", packetSchema);
