const { expect, util } = require("chai");
const { ethers } = require("hardhat");

describe("re-entrancy", function () {
  it("EtherStore合约被撸空", async function () {
    const EtherStore = await ethers.getContractFactory("EtherStore");
    let store = await EtherStore.deploy();
    await store.deployed();

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const Attack = await ethers.getContractFactory("contracts/re-entrancy/Attack.sol:Attack");
    let attack = await Attack.deploy(store.address);
    await attack.deployed();

    //others deposit some ether
    store = store.connect(addr1);
    await store.deposit({value: ethers.utils.parseEther("2")});

    store = store.connect(addr2);
    await store.deposit({value: ethers.utils.parseEther("3")});

    //attack
    attack = attack.connect(addr3);
    await attack.attack({value:ethers.utils.parseEther("1")});

    expect(await store.getBalance()).to.equal(ethers.utils.parseEther("0"));
    expect(await attack.getBalance()).to.equal(ethers.utils.parseEther("6"));
  });

  it("重入攻击解决1:先写入变量,再外部调用",async function(){
    const EtherStore = await ethers.getContractFactory("EtherStorePrev1");
    let store = await EtherStore.deploy();
    await store.deployed();

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const Attack = await ethers.getContractFactory("contracts/re-entrancy/Attack.sol:Attack");
    let attack = await Attack.deploy(store.address);
    await attack.deployed();

    //others deposit some ether
    store = store.connect(addr1);
    await store.deposit({value: ethers.utils.parseEther("2")});

    store = store.connect(addr2);
    await store.deposit({value: ethers.utils.parseEther("3")});

    //attack
    attack = attack.connect(addr3);
    await expect(attack.attack({value:ethers.utils.parseEther("1")}))
          .to.be.revertedWith("Failed to send Ether,you guys probably have no balance!");

    //因为攻击交易会失败,attack中的deposit交易也失败,状态也会被revert,所以store中的balance是5
    expect(await store.getBalance()).to.equal(ethers.utils.parseEther("5"));
    expect(await attack.getBalance()).to.equal(ethers.utils.parseEther("0"));
  });

  it("重入攻击解决2:使用防重入锁",async function(){
    const EtherStore = await ethers.getContractFactory("EtherStorePrev2");
    let store = await EtherStore.deploy();
    await store.deployed();

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const Attack = await ethers.getContractFactory("contracts/re-entrancy/Attack.sol:Attack");
    let attack = await Attack.deploy(store.address);
    await attack.deployed();

    //others deposit some ether
    store = store.connect(addr1);
    await store.deposit({value: ethers.utils.parseEther("2")});

    store = store.connect(addr2);
    await store.deposit({value: ethers.utils.parseEther("3")});

    //attack
    attack = attack.connect(addr3);
    await expect(attack.attack({value:ethers.utils.parseEther("1")}))
        .to.be.revertedWith('Failed to send Ether,the lock is guarding!');

    //因为攻击交易会失败,attack中的deposit交易也失败,状态也会被revert,所以store中的balance是5
    expect(await store.getBalance()).to.equal(ethers.utils.parseEther("5"));
    expect(await attack.getBalance()).to.equal(ethers.utils.parseEther("0"));
  });
});
