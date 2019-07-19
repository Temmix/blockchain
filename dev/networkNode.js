const express = require("express");
const app = express();
const parser = require("body-parser");
const rp = require("request-promise");
const uuid = require("uuid/v1");
app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
const BlockChain = require("./blockchain");
const port = process.argv[2];

const moxcoin = new BlockChain();
const nodeAddress = uuid()
  .split("-")
  .join("");

app.get("/blockchain", function(req, res) {
  res.send(moxcoin);
});

app.post("/transaction", function(req, res) {
  const newTransaction = req.body;
  const blockIndex = moxcoin.addTransactionToPendingTransactions(
    newTransaction
  );
  res.json({ notes: `Transaction will be added in block ${blockIndex}` });
});

app.post("/transaction/broadcast", function(req, res) {
  const newTransaction = moxcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  moxcoin.addTransactionToPendingTransactions(newTransaction);

  const requestPromises = [];
  moxcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises).then(_ => {
    res.json({ note: "Transaction created and broadcast successfully." });
  });
});

app.get("/mine", function(req, res) {
  const lastBlock = moxcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transactions: moxcoin.pendingTransactions,
    index: lastBlock["index"] + 1
  };
  const nonce = moxcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = moxcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );

  const newBlock = moxcoin.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  moxcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + "/receive-new-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(_ => {
      // give the mining reward and broadcast to sync with all nodes
      const requestOptions = {
        url: moxcoin.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: 12.5,
          sender: "00",
          recipient: nodeAddress
        },
        json: true
      };
      return rp(requestOptions);
    })
    .then(_ => {
      res.json({
        note: "New block mined and broadcast successfully",
        block: newBlock
      });
    });
});

app.post("/receive-new-block", function(req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = moxcoin.getLastBlock();
  const isHashValid = lastBlock.hash === newBlock.previousBlockHash;
  const isIndexValid = lastBlock["index"] + 1 === newBlock["index"];

  if (isHashValid && isIndexValid) {
    moxcoin.chain.push(newBlock);
    moxcoin.pendingTransactions = [];
    res.json({
      note: "New block received and accepted",
      newBlock: newBlock
    });
  } else {
    res.json({
      note: "New block rejected",
      newBlock: newBlock
    });
  }
});

app.post("/register-and-broadcast-node", function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (newNodeUrl === moxcoin.currentNodeUrl) {
    res.json({ note: "New node registered with networks successfully" });
    return;
  }

  if (moxcoin.networkNodes.indexOf(newNodeUrl) === -1)
    moxcoin.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];
  moxcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true
    };
    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises)
    .then(data => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...moxcoin.networkNodes, moxcoin.currentNodeUrl]
        },
        json: true
      };
      return rp(bulkRegisterOptions);
    })
    .then(data => {
      res.json({ note: "New node registered with networks successfully" });
    });
});

app.post("/register-node", function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (
    moxcoin.networkNodes.indexOf(newNodeUrl) === -1 &&
    moxcoin.currentNodeUrl !== newNodeUrl
  )
    moxcoin.networkNodes.push(newNodeUrl);
  res.json({ note: "New node registered successfully." });
});

app.post("/register-nodes-bulk", function(req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    if (
      moxcoin.networkNodes.indexOf(networkNodeUrl) === -1 &&
      moxcoin.currentNodeUrl !== networkNodeUrl
    ) {
      moxcoin.networkNodes.push(networkNodeUrl);
    }
  });
  res.json({ note: "Bulk registration successful" });
});

app.get("/consensus", function(req, res) {
  const requestPromises = [];
  moxcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + "/blockchain",
      method: "GET",
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises).then(blockchains => {
    const currentChainLength = moxcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach(blockchain => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });

    if (
      !newLongestChain ||
      (newLongestChain && !moxcoin.chainIsValid(newLongestChain))
    ) {
      res.json({
        note: "Current chain has not been replaced",
        chain: moxcoin.chain
      });
    } else {
      moxcoin.chain = newLongestChain;
      moxcoin.pendingTransactions = newPendingTransactions;
      res.json({
        note: "This chain has been replaced",
        chain: moxcoin.chain
      });
    }
  });
});

app.get("/block/:blockHash", function(req, res) {
  const blockHash = req.params.blockHash;
  const correctBlock = moxcoin.getBlock(blockHash);
  res.json({
    block: correctBlock
  });
});

app.get("/transaction/:transactionId", function(req, res) {
  const transactionId = req.params.transactionId;
  const response = moxcoin.getTransaction(transactionId);
  res.json({
    transaction: response.transaction,
    block: response.block
  });
});

app.get("/address/:address", function(req, res) {
  const address = req.params.address;
  const addressData = moxcoin.getAddressData(address);
  res.json({
    addressData: addressData
  });
});

app.get("/block-explorer", function(req, res) {
  res.sendFile("./block-explorer/index.html", { root: __dirname });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}.........`);
});
