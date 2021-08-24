import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import Scanner from "../src/abis/scanner.json";
import config from "../src/config.json";

class AddNode extends Component {
    async componentWillMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
    }

    async loadBlockchainData() {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        this.setState({ account: accounts[0] });
        const address = config.contractAddress;
        if (address) {
            const abi = Scanner;
            const contract = new web3.eth.Contract(abi, address);
            this.setState({ contract });
        } else {
            window.alert("Smart contract not deployed to detect network!");
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            account: "",
            contract: null,
            length: "",
        };
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

    async onSubmit() {
        const ID = document.querySelector(".input-ID").value;
        const nodeURL = document.querySelector(".input-nodeURL").value;
        const rpcURL = document.querySelector(".input-rpcURL").value;
        const nodeName = document.querySelector(".input-nodeName").value;

        this.state.contract.methods
            .createNode(ID, nodeURL, rpcURL, nodeName)
            .send({ from: this.state.account })
            .on("confirmation", (r) => {
                window.location.reload();
            });
    }

    render() {
        return (
            <div class="container">
                <div class="mx-auto">
                    <div class="content">
                        <h1 class="mb-sm-4 display-4 fw-light lh-sm fs-4 fs-lg-6 fs-xxl-7">
                            Add Node
                        </h1>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                this.onSubmit();
                            }}
                        >
                            <div class="form-group" style={{ width: "420px" }}>
                                <label for="exampleInputEmail1">Address</label>
                                <input
                                    class="form-control"
                                    aria-describedby="addressHelp"
                                    value={this.state.account}
                                    readOnly
                                />
                                <small
                                    id="addressHelp"
                                    class="form-text text-muted"
                                >
                                    If you need, change your address from
                                    metamask
                                </small>
                            </div>
                            <div class="form-group" style={{ width: "420px" }}>
                                <label for="exampleInputName">ID</label>
                                <input
                                    class="form-control input-ID"
                                    id="exampleInputName"
                                    aria-describedby="projectName"
                                />
                                <small
                                    id="projectName"
                                    class="form-text text-muted"
                                >
                                    ID
                                </small>
                            </div>
                            <div class="form-group" style={{ width: "420px" }}>
                                <label for="exampleInputName">nodeURL</label>
                                <input
                                    class="form-control input-nodeURL"
                                    id="exampleInputName"
                                    aria-describedby="projectName"
                                />
                                <small
                                    id="projectName"
                                    class="form-text text-muted"
                                >
                                    nodeURL
                                </small>
                            </div>
                            <div class="form-group" style={{ width: "420px" }}>
                                <label for="exampleInputName">rpcURL</label>
                                <input
                                    class="form-control input-rpcURL"
                                    id="exampleInputName"
                                    aria-describedby="projectName"
                                />
                                <small
                                    id="projectName"
                                    class="form-text text-muted"
                                >
                                    rpcURL
                                </small>
                            </div>
                            <div class="form-group" style={{ width: "420px" }}>
                                <label for="exampleInputName">nodeName</label>
                                <input
                                    class="form-control input-nodeName"
                                    id="exampleInputName"
                                    aria-describedby="projectName"
                                />
                                <small
                                    id="projectName"
                                    class="form-text text-muted"
                                >
                                    nodeName
                                </small>
                            </div>
                            <input
                                type="submit"
                                class="d-inline-block btn btn-primary"
                                value="Add"
                            />
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddNode;
