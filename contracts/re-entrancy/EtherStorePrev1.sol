// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "hardhat/console.sol";

contract EtherStorePrev1 {
    mapping(address => uint) public balances;

    function deposit() public payable { 
        console.log("address %s,deposit %f",msg.sender,(msg.value)/(10 ** 18));
       balances[msg.sender] += msg.value;
    }
    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0);

        //先更新状态变量,再外部调用,这种情况下再攻击,攻击交易会失败,被revert
        balances[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether,you guys probably have no balance!");
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
