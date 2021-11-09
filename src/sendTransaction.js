// sendTransaction.js script used to process the transactions

const Web3 = require("web3");
const Promise = require("bluebird");

const NUM_TX_PER_ACCOUNT = 100;

// Receiving Accounts
const RECEIVING_ACCOUNTS = [
    "0xe4b904BF9fef73c5f3d8219E41c2f5d6372766f7",
    "0x0b0BedCf5C291f700676b130938B8629971A8979",
    "0x7381545db7f2319420FA20Be1D2A7e470ee305Af",
    "0xb9488Bb64d27788117953430bB40697110e1B0Bc",
];

function benchSendTransaction({ web3, from, to, counter }) {
    return new Promise((resolve, reject) => {
        if (counter == 0) {
            return resolve(true);
        } else {
            // console.time(`eth.sendTransaction, nonce: ${nonce}`)
            web3.eth
                .sendTransaction({ from, to, value: 1e2 })
                // .once('transactionHash', (txHash) => { console.log('txHash', txHash) })
                // .once('receipt', (receipt) => { console.log('receipt', receipt) })
                // .on('confirmation', (confirmation, receipt) => { console.log('confirmation, receipt', confirmation, receipt) })
                .on("error", (error) => {
                    return reject(error);
                })
                .then((receipt) => {
                    // console.timeEnd(`eth.sendTransaction, nonce: ${nonce}`)
                    return resolve(
                        benchSendTransaction({
                            web3,
                            from,
                            to,
                            counter: counter,
                        })
                    );
                });
        }
    });
}

process.on("message", (msg) => {
    const { fromAccount, rpc } = msg;
    const web3 = new Web3(rpc);

    Promise.resolve(web3.eth.getTransactionCount(fromAccount))
        .then((count) => {
            nonce = count;
            return RECEIVING_ACCOUNTS;
        })
        .map((toAccount) => {
            console.time("eth.sendTransaction");
            return benchSendTransaction({
                web3,
                from: fromAccount,
                to: toAccount,
                counter: NUM_TX_PER_ACCOUNT,
            });
        })
        .then((finished) => {
            console.timeEnd("eth.sendTransaction");
            process.send({ finished: true });
        })
        .catch((error) => {
            console.log("error", error);
            process.send({ error: true });
        });
});
