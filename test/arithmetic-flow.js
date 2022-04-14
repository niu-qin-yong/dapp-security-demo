const { expect, util } = require("chai");
const { ethers } = require("hardhat");

describe("arithmetic-overflow-underflow", function () {
    it("时间锁失效,不需等一周,存入即可取", async function(){
        const TimeLock = await ethers.getContractFactory("TimeLock");
        const timeLock = await TimeLock.deploy();
        await timeLock.deployed();

        const Attack = await ethers.getContractFactory("contracts/arithmetic-overflow-underflow/Attack.sol:Attack");
        const attack = await Attack.deploy(timeLock.address);
        await attack.deployed();

        expect(await attack.getBalance()).to.equal("0");
        await attack.attack({value:ethers.utils.parseEther("0.5")});
        expect(await attack.getBalance()).to.equal(ethers.utils.parseEther("0.5"));

    });

    it("使用0.8.0及以上版本,内置溢出检查",async function(){
        const TimeLock = await ethers.getContractFactory("TimeLockPrev");
        const timeLock = await TimeLock.deploy();
        await timeLock.deployed();

        const Attack = await ethers.getContractFactory("contracts/arithmetic-overflow-underflow/Attack.sol:Attack");
        const attack = await Attack.deploy(timeLock.address);
        await attack.deployed();

        expect(await attack.getBalance()).to.equal("0");
        await expect(attack.attack({value:ethers.utils.parseEther("0.5")}))
            .to.be.revertedWith('Arithmetic operation underflowed or overflowed outside of an unchecked block');
        expect(await attack.getBalance()).to.equal(ethers.utils.parseEther("0"));    
    });
});