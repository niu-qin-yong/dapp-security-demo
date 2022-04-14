// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

/*
The goal of KingOfEther is to become the king by sending more Ether than
the previous king. Previous king will be refunded with the amount of Ether
he sent.
*/

/*
1. Deploy KingOfEther
2. Alice becomes the king by sending 1 Ether to claimThrone().
2. Bob becomes the king by sending 2 Ether to claimThrone().
   Alice receives a refund of 1 Ether.
3. Deploy Attack with address of KingOfEther.
4. Call attack with 3 Ether.
5. Current king is the Attack contract and no one can become the new king.

What happened?
Attack became the king. All new challenge to claim the throne will be rejected
since Attack contract does not have a fallback function, denying to accept the
Ether sent from KingOfEther before the new king is set.
*/

contract KingOfEtherPrev {
    address public king;
    uint public balance;
    mapping(address => uint) public kingBalance;

    function claimThrone() external payable {
        require(msg.value > balance, "Need to pay more to become the king");

        kingBalance[king] += balance;

        balance = msg.value;
        king = msg.sender;
    }

    function withdraw() external {
        require(msg.sender != king,"current king can't withdraw");

        uint amount = kingBalance[msg.sender];
        kingBalance[msg.sender] = 0;

        (bool sent,) = msg.sender.call{value:amount}("");
        require(sent,"Fail to sent Ether");
    }

}