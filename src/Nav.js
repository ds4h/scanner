import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import { Link } from "react-router-dom";
import Scanner from "../src/abis/scanner.json";
import config from "../src/config.json";

class Nav extends Component {
    async componentWillMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
        await this.getRole();
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
            role: "",
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

    async getRole() {
        const role = await this.state.contract.methods
            .hasRole(
                "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42",
                this.state.account
            )
            .call();

        if (role === true) {
            this.setState({ role: "ADMIN" });
        } else {
            this.setState({ role: "USER" });
        }
    }

    render() {
        return (
            <div class="w-100">
                {(() => {
                    if (this.state.role === "ADMIN") {
                        return (
                            <div
                                class=""
                                style={{
                                    background: "#32ff7e",
                                    height: "6px",
                                    width: "%100",
                                }}
                            ></div>
                        );
                    } else {
                        return (
                            <div
                                class=""
                                style={{
                                    background: "#40E0D0",
                                    height: "6px",
                                    width: "%100",
                                }}
                            ></div>
                        );
                    }
                })()}
                <div class="navigation-bar w-100" style={{ fontSize: "20px" }}>
                    <div
                        class="user-info mx-auto nav-item"
                        style={{ fontSize: "14px", width: "1800px" }}
                    >
                        You are logged as: {this.state.account}
                        <span style={{ float: "right" }}>
                            {" "}
                            Role: {this.state.role}
                        </span>
                    </div>
                    <div class="mx-auto" style={{ width: "1800px" }}>
                        <nav class="navbar navbar-expand-lg navbar-light ">
                            <Link
                                style={{ textDecoration: "none" }}
                                to="/"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                            >
                                <a
                                    class="navbar-brand"
                                    href="/"
                                    style={{
                                        fontFamily: '"Roboto", sans-serif',
                                        fontSize: "xx-large",
                                    }}
                                >
                                    Scanner
                                </a>
                                <span class="badge badge-primary">beta</span>
                            </Link>
                            <button
                                class="navbar-toggler"
                                type="button"
                                data-toggle="collapse"
                                data-target="#navbarNav"
                                aria-controls="navbarNav"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div
                                class="collapse navbar-collapse"
                                id="navbarNav"
                            >
                                <ul class="nav navbar-nav ml-auto">
                                    <li class="nav-item active">
                                        <Link
                                            style={{ textDecoration: "none" }}
                                            to="/"
                                        >
                                            <a class="nav-link" href="/">
                                                Home
                                            </a>
                                        </Link>
                                    </li>
                                    {(() => {
                                        if (this.state.role === "ADMIN") {
                                            return (
                                                <ul class="nav navbar-nav ml-auto">
                                                    <li class="nav-item">
                                                        <Link
                                                            style={{
                                                                textDecoration:
                                                                    "none",
                                                            }}
                                                            to="/validate"
                                                        >
                                                            <a
                                                                class="nav-link"
                                                                href="/validate"
                                                            >
                                                                Validate
                                                            </a>
                                                        </Link>
                                                    </li>
                                                    <li class="nav-item">
                                                        <Link
                                                            style={{
                                                                textDecoration:
                                                                    "none",
                                                            }}
                                                            to="/addnode"
                                                        >
                                                            <a
                                                                class="nav-link"
                                                                href="/addnode"
                                                            >
                                                                Add Node
                                                            </a>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            );
                                        } else {
                                        }
                                    })()}
                                </ul>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        );
    }
}

export default Nav;
