// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Scanner is AccessControl {
    bytes32 public constant ADMIN = keccak256("ADMIN");
    event Unreachable(address indexed _controller, string  _nodeRPC, uint indexed _date);
    uint tpsLimit = 100;

    constructor()  {
        _setupRole(ADMIN, msg.sender);
    }
    
    struct Node{
        uint256 nodeID;
        string ID;
        string nodeURL;
        string rpcURL;
        string nodeName;
        string email;
        uint tpsLimit;
    }

    uint256 TotalNodesCount;

    Node[] NodesList;
    Node[] ValidNodesList;

    mapping(uint256 => Node) NodesMap;    
    mapping(uint256 => string) ValidNodesMap;
    event control(uint date, address from,  Node[] nodes);
    
    function createNode(
        string memory _ID,
        string memory _nodeURL,
        string memory _rpcURL,
        string memory _nodeName,
        string memory _email
        ) public  {  require(hasRole(ADMIN, msg.sender));
            Node memory newNode = Node({     
                nodeID: TotalNodesCount,
                ID: _ID,
                nodeURL: _nodeURL,    
                rpcURL: _rpcURL,                         
                nodeName: _nodeName,
                email: _email
                tps_Limit: tpsLimit;
            });
        
        NodesMap[TotalNodesCount] = newNode;  
        ValidNodesMap[TotalNodesCount] = "INVALID";
        NodesList.push(newNode);
        TotalNodesCount++;
        emit control(block.timestamp, msg.sender, NodesList);
    }

    function validateNode(uint256 _nodeID) public { require(hasRole(ADMIN, msg.sender));
        Node memory node = NodesMap[_nodeID];
        ValidNodesMap[_nodeID] = "VALID";
        ValidNodesList.push(node);
        for(uint256 x = 0; x < NodesList.length; x++){
            if(NodesList[x].nodeID == NodesMap[_nodeID].nodeID){
                delete NodesList[x];
            }
        }
    }

    function invalidateNode(uint256 _nodeID) public { require(hasRole(ADMIN, msg.sender));
        Node memory node = NodesMap[_nodeID];
        ValidNodesMap[_nodeID] = "INVALID";
        NodesList.push(node);
        for(uint256 x = 0; x < ValidNodesList.length; x++){
            if(ValidNodesList[x].nodeID == NodesMap[_nodeID].nodeID){
                delete ValidNodesList[x];
            }
        }
    }
    
    
    /*
    function getNode(uint256 nodeID) public view returns(string memory nodeURL, string memory nodeName){
        Node memory node = NodesMap[nodeID];
        return (node.nodeURL, node.nodeName); 
    }*/
    
    
    function unreachable(string memory _nodeRPC) public payable {      
      emit Unreachable(msg.sender, _nodeRPC, block.timestamp);
    }

    function getAllNodes() public view returns (Node[] memory) {
        return NodesList;
    }

    function getValidNodes() public view returns (Node[] memory) {
        return ValidNodesList;
    }

    function getNodeCount() public view returns(uint256){
        return TotalNodesCount;
    }
    
}
