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
        };
    }

    async checkLatestBlock() {
        const latestBlock = await web3.eth.getBlockNumber();
        const peerCount = await web3.eth.net.getPeerCount();
        const gasPrice = await web3.eth.getGasPrice();
        this.setState({ latestBlock });
        this.setState({ peerCount: peerCount + 1 });
        this.setState({ gasPrice });
    }

    async nodeStatus(rpcURL) {
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

    async getNodes() {
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
