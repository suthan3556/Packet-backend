
function validatePacket(packet) {
  const errors = [];

  // IPv4 Regular Expression
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

  // Validate Source IP
  if (!ipRegex.test(String(packet.sourceIP || "").trim())) {
    errors.push("Invalid Source IP Address");
  }

  // Validate Destination IP
  if (!ipRegex.test(String(packet.destinationIP || "").trim())) {
    errors.push("Invalid Destination IP Address");
  }

  // Validate Port
  function checkPort(port, fieldName, required = true) {
    if (
      (port === undefined || port === null || port === "") &&
      !required
    ) {
      return;
    }

    const value = Number(port);

    if (
      port === undefined ||
      port === null ||
      port === "" ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 65535
    ) {
      errors.push(
        `${fieldName} must be an integer between 0 and 65535`
      );
    }
  }

  const protocol = String(packet.protocol || "")
    .trim()
    .toUpperCase();

  if (!protocol) {
    errors.push("Protocol is required");
  }

  // TCP and UDP require ports.
  // ICMP does not use TCP/UDP port numbers.
  if (protocol === "TCP" || protocol === "UDP") {
    checkPort(packet.sourcePort, "Source Port");
    checkPort(packet.destinationPort, "Destination Port");
  } else if (protocol === "ICMP") {
    checkPort(packet.sourcePort, "Source Port", false);
    checkPort(packet.destinationPort, "Destination Port", false);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = validatePacket;
