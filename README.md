# Scanner
Scanner is a ...

## Installation

```bash
git clone https://github.com/ds4h/scanner.git
cd scanner
```

```bash
npm install
```

## Usage
Before running the dapp, make sure the [config](https://github.com/ds4h/scanner/blob/main/src/config.json) file is correct. <br />

Start Scanner on terminal. This script checks the status of valid nodes in the connected network every 5 minutes. It sends a warning email to the owners of inaccessible nodes. If the node continues to be unavailable according to predetermined conditions, it initiates a vote to kick the node off the network.
```bash 
npm run start
```
Start Scanner with UI. In addition to the functions of the script, the features and status of the nodes in the network can be displayed with user interface. Node addition and validation can also be done by users with the "ADMIN" role.
```bash
npm run ui
```
### Figure 1: Scanner
<img src="https://github.com/ds4h/scanner/blob/main/src/images/ss1.png" width="800" alt="Yadigar sistem şeması">
