import React, { Component } from "react";
import emailjs from "emailjs-com";
import Web3 from "web3";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import Scanner from "../src/abis/scanner.json";
import config from "../src/config.json";
import net from "net";
const axios = require("axios");

var statusVar = "";
var rowColor = "";

const web3 = new Web3(
    new Web3.providers.WebsocketProvider(config.WebsocketProvider)
);

const address = config.contractAddress;
const abi = Scanner;
const contract = new web3.eth.Contract(abi, address);



class Nodes extends Component {
    async componentWillMount() {
        //await this.nodeX();
        await this.loadWeb3();
        this.setState({ contract });
        await this.getNodes();
    }
    async componentDidMount() {
        this.interval = setInterval(() => this.checkLatestBlock(), 1000);
    }

    constructor(props) {
        super(props);
        this.state = {
            account: "",
            contract: null,
            length: "",
            latestBlock: null,
            peerCount: null,
            gasPrice: null,
            networkTPS: null,
            node1: null,
            node2: null,
            node3: null,
            node4: null,
            tps1: null,
            tps2: null,
            tps3: null,
            tps4: null,
            tpsLimit: null
        };
    }
    async nodeX(rpcURL) {
        const data = JSON.stringify({});
        await axios
            .post(rpcURL, {
                jsonrpc: "2.0",
                method: "admin_stopRPC",
                params: null,
            })
            .then((res) => {
                console.log(`statusCode: ${res.status}`);
                console.log(res);
                console.log("error");
            })
            .catch((error) => {
                //console.error(error);
                console.log("error");
            });
    }

    async checkLatestBlock() {
        const latestBlock = await web3.eth.getBlockNumber();
        const peerCount = await web3.eth.net.getPeerCount();
        const gasPrice = await web3.eth.getGasPrice();

        // Sender addresses for testing
        let node1 = await web3.eth.getTransactionCount(
            "0x86e961c7b74f760fe5df0623f1bbd048c643f653"
        );
        let node2 = await web3.eth.getTransactionCount(
            "0xa80ca1e0b974d7810f092b6601f7d4de746525ec"
        );
        let node3 = await web3.eth.getTransactionCount(
            "0x00efc7770c70893b75df44d243a31506fbbd675f"
        );
        let node4 = await web3.eth.getTransactionCount(
            "0x94d7bb7ef4cc5deb17ee7dc4305243526808bb4d"
        );

        if (node1 != this.state.node1) {
            this.state.tps1 = node1 - this.state.node1;
        } else {
            this.state.tps1 = 0;
        }
        if (node2 != this.state.node2) {
            this.state.tps2 = node2 - this.state.node2;
        } else {
            this.state.tps2 = 0;
        }
        if (node3 != this.state.node3) {
            this.state.tps3 = node3 - this.state.node3;
        } else {
            this.state.tps3 = 0;
        }
        if (node4 != this.state.node4) {
            this.state.tps4 = node4 - this.state.node4;
        } else {
            this.state.tps4 = 0;
        }

        this.setState({ node1 });
        this.setState({ node2 });
        this.setState({ node3 });
        this.setState({ node4 });

        console.log(this.state.tps1);
        console.log(this.state.tps2);
        console.log(this.state.tps3);
        console.log(this.state.tps4);

        // TPS
        const currentBlock = await web3.eth.getBlock("latest");
        let result = null;
        if (currentBlock.number !== null) {
            //only when block is mined not pending
            const previousBlock = await web3.eth.getBlock(
                currentBlock.parentHash
            );
            if (previousBlock.number !== null) {
                const timeTaken =
                    currentBlock.timestamp - previousBlock.timestamp;
                const transactionCount = currentBlock.transactions.length;
                const tps = transactionCount / timeTaken;
                result = tps;
            }
        }

        // Test network
        if (this.state.tps1 > this.state.tpsLimit) {
            this.nodeX("http://127.0.0.1:22000");
        } else if (this.state.tps2 > this.state.tpsLimit) {
            this.nodeX("http://127.0.0.1:22001");
        } else if (this.state.tps3 > this.state.tpsLimit) {
            this.nodeX("http://127.0.0.1:22002");
        } else if (this.state.tps4 > this.state.tpsLimit) {
            this.nodeX("http://127.0.0.1:22003");
        }

        this.setState({ latestBlock });
        this.setState({ peerCount: peerCount + 1 });
        this.setState({ gasPrice });
        this.setState({ networkTPS: result });
    }

    async getNodes() {
        // Default value is 100
        var tpsLimit = await this.state.contract.methods
            .getTpsLimit()
            .call();
        this.setState({ tpsLimit });
        var x = 0;
        var getNodesList = await this.state.contract.methods
            .getValidNodes()
            .call();
        const tbody = document.querySelector("#tbody");

        for (var i = 0; i < getNodesList.length; i++) {
            if (!getNodesList[i][1] == "") {
                var today = new Date();
                var time =
                    today.getHours() +
                    ":" +
                    today.getMinutes() +
                    ":" +
                    today.getSeconds();
                await this.nodeStatus(getNodesList[i][3]);
                if (statusVar === "up") {
                    rowColor = "success";
                    x++;
                } else {
                    const accounts = await web3.eth.getAccounts();
                    rowColor = "danger";
                    console.log(
                        "The node with rpcURL: " +
                            getNodesList[i][3] +
                            " is unreachable. Email is sending to the node owner."
                    );
                    this.state.contract.methods
                        .unreachable(getNodesList[i][3])
                        .send({
                            from: accounts[0],
                            value: web3.utils.toWei("0", "ether"),
                            gas: "28387",
                            gasPrice: "0",
                        });
                }
                if (x === getNodesList.length) {
                    console.log(
                        "A total of " +
                            getNodesList.length +
                            " nodes are working normally. ------ " +
                            time
                    );
                }
                tbody.innerHTML += `
            <tr >
            <td class="table-${rowColor}">${getNodesList[i][0]}</td>
            <td class="table-${rowColor}">${getNodesList[i][1]}</td>
            <td class="table-${rowColor}">${getNodesList[i][2]}</td>
            <td class="table-${rowColor}">${getNodesList[i][3]}</td>
            <td class="table-${rowColor}">${getNodesList[i][4]}</td>
            <td class="table-${rowColor}">${statusVar}</td>
          </tr>
          `;
            }
        }
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert(
                "Non-Ethereum browser detected. You should consider trying MetaMask!"
            );
        }
    }

    render() {
        return (
            <div class="container-fluid">
                <div class="mx-auto">
                    <div class="content">
                        <hr></hr>
                        <div className="row">
                            <div className="col">
                                <div
                                    className="card border-light mb-3"
                                    style={{ maxWidth: "420px" }}
                                >
                                    <div className="row g-0">
                                        <div className="col-md-auto">
                                            <i class="fas fa-cubes fa-7x"></i>
                                        </div>
                                        <div className="col-md-auto">
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    Latest Block
                                                </h5>
                                                <h1
                                                    className="card-text"
                                                    style={{ color: "blue" }}
                                                >
                                                    {this.state.latestBlock}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div
                                    className="card border-light mb-3"
                                    style={{ maxWidth: "420px" }}
                                >
                                    <div className="row g-0">
                                        <div className="col-md-auto">
                                            <i class="fas fa-users fa-7x"></i>
                                        </div>
                                        <div className="col-md-auto">
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    Node Count
                                                </h5>
                                                <h1
                                                    className="card-text"
                                                    style={{ color: "blue" }}
                                                >
                                                    {this.state.peerCount}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div
                                    className="card border-light mb-3"
                                    style={{ maxWidth: "420px" }}
                                >
                                    <div className="row g-0">
                                        <div className="col-md-auto">
                                            <i class="fas fa-fire fa-7x"></i>
                                        </div>
                                        <div className="col-md-auto">
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    Gas Price
                                                </h5>
                                                <h1
                                                    className="card-text"
                                                    style={{ color: "blue" }}
                                                >
                                                    {this.state.gasPrice}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col">
                                <div
                                    className="card border-light mb-3"
                                    style={{ maxWidth: "420px" }}
                                >
                                    <div className="row g-0">
                                        <div className="col-md-auto">
                                            <i class="fas fa-tachometer-alt fa-7x"></i>
                                        </div>
                                        <div className="col-md-auto">
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    TPS
                                                </h5>
                                                <h1
                                                    className="card-text"
                                                    style={{ color: "blue" }}
                                                >
                                                    {this.state.networkTPS}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br></br>
                        <h3>Valid Nodes</h3>
                        <div class="table-responsive">
                            <table
                                className="table"
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th scope="col">nodeID</th>
                                        <th scope="col">ID</th>
                                        <th scope="col">nodeURL</th>
                                        <th scope="col">rpcURL</th>
                                        <th scope="col">nodeName</th>
                                        <th scope="col">status</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Nodes;
