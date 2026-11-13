
const alphabet = ["T", "C", "P", "U", "D", "I", "M"];

const transitions = {
  START: {
    T: "T",
    U: "U",
    I: "I"
  },

  T: { C: "TC" },
  TC: { P: "TCP_ACCEPT" },

  U: { D: "UD" },
  UD: { P: "UDP_ACCEPT" },

  I: { C: "IC" },
  IC: { M: "ICM" },
  ICM: { P: "ICMP_ACCEPT" }
};

const acceptingStates = [
  "TCP_ACCEPT",
  "UDP_ACCEPT",
  "ICMP_ACCEPT"
];

function classifyProtocol(input) {
  let currentState = "START";

  const protocol = String(input || "").trim().toUpperCase();

  for (const symbol of protocol) {
    if (!alphabet.includes(symbol)) {
      currentState = "REJECT";
    } else if (currentState === "REJECT") {
      currentState = "REJECT";
    } else {
      currentState =
        transitions[currentState]?.[symbol] || "REJECT";
    }
  }

  const accepted = acceptingStates.includes(currentState);

  return {
    accepted,
    classification: accepted
      ? currentState.replace("_ACCEPT", "")
      : "UNKNOWN",
    finalState: accepted ? currentState : "REJECT",
    alphabet
  };
}

module.exports = classifyProtocol;
