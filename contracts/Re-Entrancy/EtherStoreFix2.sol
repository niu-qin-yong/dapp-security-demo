// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "hardhat/console.sol";

contract EtherStoreFix2 {
    mapping(address => uint) public balances;
    mapping(address => bool) private enterLock;

    //加把锁
    modifier ReEntrancyGuard{
        require(!enterLock[msg.sender],"No ReEntrancy");

        enterLock[msg.sender] = true;
        _;
        enterLock[msg.sender] = false;
    }

    function deposit() public payable { 
        console.log("address %s,deposit %f",msg.sender,(msg.value)/(10 ** 18));
       balances[msg.sender] += msg.value;
    }

    //在一次取款操作完成前,不允许再次取款
    function withdraw() public ReEntrancyGuard {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether,the lock is guarding!");

        balances[msg.sender] = 0;
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
