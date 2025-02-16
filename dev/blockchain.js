const sha256 = require("sha256");
const uuid = require("uuid/v1");
const currentNodeUrl = process.argv[3];

function BlockChain() {
  this.chain = [];
  this.pendingTransactions = [];
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  // Genesis Block: mean the first Block in
  // all blockchain,you can pass any arbitrary values
  this.createNewBlock(100, "0", "0");
}

BlockChain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash
  };

  this.pendingTransactions = [];
  this.chain.push(newBlock);
  return newBlock;
};

BlockChain.prototype.getLastBlock = function() {
  return this.chain[this.chain.length - 1];
};

BlockChain.prototype.createNewTransaction = function(
  amount,
  sender,
  recipient
) {
  const newTransaction = {
    amount: amount,
    sender: sender,
    recipient: recipient,
    transactionId: uuid()
      .split("-")
      .join("")
  };
  return newTransaction;
};

BlockChain.prototype.addTransactionToPendingTransactions = function(
  transactionObj
) {
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()["index"] + 1;
};

BlockChain.prototype.hashBlock = function(
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataString);
  return hash;
};

/**
 * @method proofOfWork
 * This is to try and get a nonce that will produce a hash that starts with 0000
 * @return {@int nonce}
 */
BlockChain.prototype.proofOfWork = function(
  previousBlockHash,
  currentBlockData
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};

BlockChain.prototype.chainIsValid = function(blockchain) {
  let validChain = true;

  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];
    const blockHash = this.hashBlock(
      prevBlock["hash"],
      {
        transactions: currentBlock["transactions"],
        index: currentBlock["index"]
      },
      currentBlock["nonce"]
    );

    if (blockHash.substring(0, 4) !== "0000") validChain = false;
    if (currentBlock["previousBlockHash"] !== prevBlock["hash"])
      validChain = false;
  }

  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock["nonce"] === 100;
  const correctPreviousBlockHash = genesisBlock["previousBlockHash"] === "0";
  const correctHash = genesisBlock["hash"] === "0";
  const correctTransactions = genesisBlock["transactions"].length === 0;

  if (
    !correctNonce ||
    !correctHash ||
    !correctPreviousBlockHash ||
    !correctTransactions
  )
    validChain = false;
  return validChain;
};

BlockChain.prototype.getBlock = function(blockHash) {
  let correctBlock = null;
  this.chain.forEach(block => {
    if (block.hash === blockHash) correctBlock = block;
  });
  return correctBlock;
};

BlockChain.prototype.getTransaction = function(transactionId) {
  let correctTransaction = null;
  let correctBlock = null;
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.transactionId === transactionId) {
        correctTransaction = transaction;
        correctBlock = block;
      }
    });
  });
  return {
    transaction: correctTransaction,
    block: correctBlock
  };
};

BlockChain.prototype.getAddressData = function(address) {
  const addressTransactions = [];
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.sender === address || transaction.recipient === address) {
        addressTransactions.push(transaction);
      }
    });
  });

  let balance = 0;
  addressTransactions.forEach(transaction => {
    if (transaction.recipient === address) balance += transaction.amount;
    else if (transaction.sender === address) balance -= transaction.amount;
  });

  return {
    addressTransactions: addressTransactions,
    addressBalance: balance
  };
};

module.exports = BlockChain;
