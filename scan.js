const Web3 = require("web3");
const Scanner = require("./src/abis/scanner.json");
const config = require("./src/config.json");
const axios = require("axios");
var nodemailer = require("nodemailer");
var statusVar = "";
var net = require("net");

const web3 = new Web3(
    new Web3.providers.WebsocketProvider(config.WebsocketProvider)
);
const address = config.contractAddress;
const abi = Scanner;
const contract = new web3.eth.Contract(abi, address);
console.log("Scanner is started.");

contract.events.Unreachable({}, (error, log) => {
    if (error) {
        console.log("Error", error);
    }
    //console.log("Log", log);
});

async function nodeStatus(rpcURL) {
    const data = JSON.stringify({});
    await axios
        .post(rpcURL, {
            jsonrpc: "2.0",
            method: "web3_clientVersion",
            params: null,
            id: 0,
        })
        .then((res) => {
            //console.log(`statusCode: ${res.status}`);
            //console.log(res.data.result);
            statusVar = "up";
        })
        .catch((error) => {
            //console.error(error);
            //console.log("error");
            statusVar = "down";
        });
}

async function sendAlert(unreachableNode) {
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.alertSenderGmail,
            pass: config.alertSenderPassword,
        },
    });

    var mailOptions = {
        from: config.alertSenderGmail,
        to: "example@gmail.com",
        subject: "A node is unreachable",
        text: "The node with rpcURL: " + unreachableNode + " is unreachable",
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(
                "Email sent: " + info.response + "   to" + unreachableNode
            );
        }
    });
}

async function checkNodes() {
    var x = 0;
    var getNodesList = await contract.methods.getValidNodes().call();
    for (var i = 0; i < getNodesList.length; i++) {
        var today = new Date();
        var time =
            today.getHours() +
            ":" +
            today.getMinutes() +
            ":" +
            today.getSeconds();
        await nodeStatus(getNodesList[i][3]);
        if (statusVar == "up") {
            x++;
        } else {
            const accounts = await web3.eth.getAccounts();
            console.log(
                "The node with rpcURL: " +
                    getNodesList[i][3] +
                    " is unreachable. Email is sending to the node owner."
            );
            contract.methods.unreachable(getNodesList[i][3]).send({
                from: accounts[0],
                value: web3.utils.toWei("0", "ether"),
                gas: "28387",
                gasPrice: "0",
            });
            unreachableNode = getNodesList[i][3];
            sendAlert(unreachableNode);
        }
        if (x == getNodesList.length) {
            console.log(
                "A total of " +
                    getNodesList.length +
                    " nodes are working normally. ------ " +
                    time
            );
        }
    }
    if (x == 0) {
        console.log("There is no nodes.");
    }
}

checkNodes();
setInterval(function () {
    checkNodes();
}, 5000);
