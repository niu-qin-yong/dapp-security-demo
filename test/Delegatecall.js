const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Delegatecall",function(){
    it("HackMe的owner被修改为Attack的合约地址",async function(){
        const Lib = await ethers.getContractFactory("Lib");
        let lib = await Lib.deploy();
        await lib.deployed();

        const HackMe = await ethers.getContractFactory("HackMe");
        let hackMe = await HackMe.deploy(lib.address);
        await hackMe.deployed();

        const Attack = await ethers.getContractFactory("contracts/Delegatecall/Attack.sol:Attack");
        let attack = await Attack.deploy(hackMe.address);
        await attack.deployed();    
        
        const [ owner ] = await ethers.getSigners();
        expect(await hackMe.owner()).to.hexEqual(owner.address);

        await attack.attack();

        expect(await hackMe.owner()).to.hexEqual(attack.address);
    });

    it("delegatecall 的 calling 和 called 合约的 storage layout 要一致",async function(){
        const LibPrev = await ethers.getContractFactory("LibPrev");
        let lib = await LibPrev.deploy();
        await lib.deployed();

        const HackMe = await ethers.getContractFactory("HackMe");
        let hackMe = await HackMe.deploy(lib.address);
        await hackMe.deployed();

        const Attack = await ethers.getContractFactory("contracts/Delegatecall/Attack.sol:Attack");
        let attack = await Attack.deploy(hackMe.address);
        await attack.deployed();    
        
        const [ owner ] = await ethers.getSigners();
        expect(await hackMe.owner()).to.hexEqual(owner.address);
        
        await attack.attack();
        
        expect(await hackMe.owner()).to.hexEqual(owner.address);
        expect(await hackMe.someNumber()).to.equal(1);
    });
});