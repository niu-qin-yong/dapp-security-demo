const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("selfdestruct",function(){
    it("EtherGame被攻击,不能再deposit,但也没有winner产生",async function(){
        const EtherGame = await ethers.getContractFactory("EtherGame");
        let game = await EtherGame.deploy();
        await game.deployed();

        const Attack = await ethers.getContractFactory("contracts/selfdestruct/Attack.sol:Attack");
        let attack = await Attack.deploy(game.address);
        await attack.deployed();

        const [owner,signer1,signer2,signer3] = await ethers.getSigners();

        //regular deposit
        game = game.connect(signer1);
        await game.deposit({value:ethers.utils.parseEther("1")});

        game = game.connect(signer2);
        await game.deposit({value:ethers.utils.parseEther("1")});

        //attack
        attack = attack.connect(signer3);
        await attack.attack({value:ethers.utils.parseEther("5")});

        //can't deposit again
        await expect(game.deposit({value:ethers.utils.parseEther("1")}))
            .to.be.revertedWith("Game is over");
        //no winner
        expect(await game.winner()).to.hexEqual("0x0");

    });

    it("不依赖 address(this).balance,使用单独的变量记录余额",async function(){
        const EtherGame = await ethers.getContractFactory("EtherGamePrev");
        let game = await EtherGame.deploy();
        await game.deployed();

        const Attack = await ethers.getContractFactory("contracts/selfdestruct/Attack.sol:Attack");
        let attack = await Attack.deploy(game.address);
        await attack.deployed();

        const [owner,signer1,signer2,signer3] = await ethers.getSigners();

        //regular deposit
        game = game.connect(signer1);
        for(let i = 0;i < 5;i++){
            await game.deposit({value:ethers.utils.parseEther("1")});
        }

        //invalid attack
        attack = attack.connect(signer2);
        await attack.attack({value:ethers.utils.parseEther("2")});
        expect(await game.balance()).to.equal(ethers.utils.parseEther("5"));

        //can deposit again
        game = game.connect(signer3);
        await game.deposit({value:ethers.utils.parseEther("1")});
        await game.deposit({value:ethers.utils.parseEther("1")});
        
        //winner is generated
        expect(await game.winner()).to.hexEqual(signer3.address);

        //game is over
        await expect(game.deposit({value:ethers.utils.parseEther("1")}))
            .to.be.revertedWith("Game is over");

    });
});