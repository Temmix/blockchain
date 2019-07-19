const BlockChain = require("./blockchain");

const bitcoin = new BlockChain();
const bc1 = {
  chain: [
    {
      index: 1,
      timestamp: 1563525312394,
      transactions: [],
      nonce: 100,
      hash: "0",
      previousBlockHash: "0"
    },
    {
      index: 2,
      timestamp: 1563525349208,
      transactions: [],
      nonce: 18140,
      hash: "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
      previousBlockHash: "0"
    },
    {
      index: 3,
      timestamp: 1563525383209,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "1ff0afa0aa0011e9b8ad692728203210",
          transactionId: "35e590f0aa0011e9b8ad692728203210"
        },
        {
          amount: 10,
          sender: "GFDSFGS564564THFDGH",
          recipient: "5645645GFDSFGSF56564",
          transactionId: "3d9026d0aa0011e9b8ad692728203210"
        },
        {
          amount: 20,
          sender: "GFDSFGS564564THFDGH",
          recipient: "5645645GFDSFGSF56564",
          transactionId: "415da990aa0011e9b8ad692728203210"
        },
        {
          amount: 30,
          sender: "GFDSFGS564564THFDGH",
          recipient: "5645645GFDSFGSF56564",
          transactionId: "44776cb0aa0011e9b8ad692728203210"
        }
      ],
      nonce: 20950,
      hash: "0000038a0b67a4419e8e984cdfe0038c0e6c1abe0c9bbc5ef160d72d0a1d4987",
      previousBlockHash:
        "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
      index: 4,
      timestamp: 1563525420279,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "1ff0afa0aa0011e9b8ad692728203210",
          transactionId: "4a2436c0aa0011e9b8ad692728203210"
        },
        {
          amount: 40,
          sender: "GFDSFGS564564THFDGH",
          recipient: "5645645GFDSFGSF56564",
          transactionId: "53303160aa0011e9b8ad692728203210"
        },
        {
          amount: 50,
          sender: "GFDSFGS564564THFDGH",
          recipient: "5645645GFDSFGSF56564",
          transactionId: "562b9710aa0011e9b8ad692728203210"
        },
        {
          amount: 60,
          sender: "GFDSFGS564564THFDGH",
          recipient: "5645645GFDSFGSF56564",
          transactionId: "58842d10aa0011e9b8ad692728203210"
        },
        {
          amount: 70,
          sender: "GFDSFGS564564THFDGH",
          recipient: "5645645GFDSFGSF56564",
          transactionId: "5b465a50aa0011e9b8ad692728203210"
        }
      ],
      nonce: 44415,
      hash: "00004b97825e1cd192f752cfd134cb49d7c7b8554775631e42194b24d014c4b6",
      previousBlockHash:
        "0000038a0b67a4419e8e984cdfe0038c0e6c1abe0c9bbc5ef160d72d0a1d4987"
    }
  ],
  pendingTransactions: [
    {
      amount: 12.5,
      sender: "00",
      recipient: "1ff0afa0aa0011e9b8ad692728203210",
      transactionId: "603ca5a0aa0011e9b8ad692728203210"
    }
  ],
  currentNodeUrl: "http://localhost:3001",
  networkNodes: []
};

console.log("BLOCK CHAIN VALID", bitcoin.chainIsValid(bc1.chain));
