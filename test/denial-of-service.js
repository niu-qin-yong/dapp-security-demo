const { expect, util } = require("chai");
const { ethers } = require("hardhat");

describe("DoS",function(){
    it("KingOfEther DoS",async function(){
        const KingOfEther = await ethers.getContractFactory("KingOfEther");
        let king = await KingOfEther.deploy();
        await king.deployed();
        
        const Attack = await ethers.getContractFactory("contracts/denial-of-service/Attack.sol:Attack");
        let attack = await Attack.deploy(king.address);
        await attack.deployed();

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();

        //normal user to claimThrone
        king = king.connect(addr1);
        await king.claimThrone({value: ethers.utils.parseEther("1")});

        king = king.connect(addr2);
        await king.claimThrone({value: ethers.utils.parseEther("2")});

        //attack
        attack = attack.connect(addr3);
        await attack.attack({value: ethers.utils.parseEther("3")});

        expect(await king.balance()).to.equal(ethers.utils.parseEther("3"));
        await expect(king.claimThrone({value: ethers.utils.parseEther("4")}))
            .to.be.revertedWith('Failed to send Ether');
        expect(await king.balance()).to.equal(ethers.utils.parseEther("3"));
    });

    it.only("withdraw instead of sending",async function(){
        const KingOfEtherPrev = await ethers.getContractFactory("KingOfEtherPrev");
        let king = await KingOfEtherPrev.deploy();
        await king.deployed();
        
        const Attack = await ethers.getContractFactory("contracts/denial-of-service/Attack.sol:Attack");
        let attack = await Attack.deploy(king.address);
        await attack.deployed();

        const [owner, addr1, addr2, addr3] = await ethers.getSigners();

        //normal user to claimThrone
        king = king.connect(addr1);
        await king.claimThrone({value: ethers.utils.parseEther("1")});

        king = king.connect(addr2);
        await king.claimThrone({value: ethers.utils.parseEther("2")});

        //attack,but usesless,the addr3 is king now
        attack = attack.connect(addr3);
        await attack.attack({value: ethers.utils.parseEther("3")});

        expect(await king.balance()).to.equal(ethers.utils.parseEther("3"));

        //the addr2 is king now
        await king.claimThrone({value: ethers.utils.parseEther("4")})

        expect(await king.balance()).to.equal(ethers.utils.parseEther("4"));
        expect(await king.king()).to.hexEqual(addr2.address);

        //current king can't withdraw
        await expect(king.withdraw())
            .to.be.revertedWith("current king can't withdraw");

        //addr1 can withdraw
        king = king.connect(addr1);
        await expect(() => king.withdraw())
            .to.changeEtherBalance(addr1, ethers.utils.parseEther("1"));
    });
});