const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CommitRevealLottery", function () {
    let Lottery;
    let lottery;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addrs;

    const ticketPrice = ethers.parseEther("0.1");
    const roundDuration = 60; // 60 seconds for testing
    const revealDuration = 60; // 60 seconds for testing

    beforeEach(async function () {
        Lottery = await ethers.getContractFactory("CommitRevealLottery");
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        lottery = await Lottery.deploy(owner, ticketPrice, roundDuration, revealDuration);
        await lottery.waitForDeployment();
    });

    describe("Commit Phase", function () {
        it("should allow users to commit with correct ticket price", async function () {
            const commitment = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [1234, ethers.encodeBytes32String("secret")]));
            await lottery.connect(addr1).commit(commitment, { value: ticketPrice });
            const playerData = await lottery.playerData(addr1.address);
            expect(playerData.commitment).to.equal(commitment);
            expect(playerData.guess).to.equal(0);
        });

        it("should reject commit with incorrect ticket price", async function () {
            const commitment = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [1234, ethers.encodeBytes32String("secret")]));
            await expect(lottery.connect(addr1).commit(commitment, { value: ethers.parseEther("0.05") })).to.be.revertedWith("Incorrect ticket price.");
        });

        it("should reject commit after commit phase ends", async function () {
            const commitment = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [1234, ethers.encodeBytes32String("secret")]));
            await ethers.provider.send("evm_increaseTime", [roundDuration + 1]);
            await ethers.provider.send("evm_mine", []);
            await expect(lottery.connect(addr1).commit(commitment, { value: ticketPrice })).to.be.revertedWith("The commit phase has ended.");
        });
    });

    describe("Reveal Phase", function () {
        beforeEach(async function () {
            const commitment1 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [1234, ethers.encodeBytes32String("secret1")]));
            const commitment2 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [5678, ethers.encodeBytes32String("secret2")]));
            await lottery.connect(addr1).commit(commitment1, { value: ticketPrice });
            await lottery.connect(addr2).commit(commitment2, { value: ticketPrice });
            await ethers.provider.send("evm_increaseTime", [roundDuration + 1]);
            await ethers.provider.send("evm_mine", []);
        });

        it("should allow users to reveal their commitment", async function () {
            await lottery.connect(addr1).reveal(1234, ethers.encodeBytes32String("secret1"));
            const playerData = await lottery.playerData(addr1.address);
            expect(playerData.guess).to.equal(1234);
        });

        it("should reject reveal with incorrect commitment", async function () {
            await expect(lottery.connect(addr1).reveal(1234, ethers.encodeBytes32String("wrongsecret"))).to.be.revertedWith("Invalid reveal.");
        });

        it("should reject reveal after reveal phase ends", async function () {
            await ethers.provider.send("evm_increaseTime", [revealDuration + 1]);
            await ethers.provider.send("evm_mine", []);
            await expect(lottery.connect(addr1).reveal(1234, ethers.encodeBytes32String("secret1"))).to.be.revertedWith("The reveal phase has ended.");
        });
    });

    describe("Drawing Winner", function () {
        beforeEach(async function () {
            const commitment1 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [1234, ethers.encodeBytes32String("secret1")]));
            const commitment2 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [5678, ethers.encodeBytes32String("secret2")]));
            await lottery.connect(addr1).commit(commitment1, { value: ticketPrice });
            await lottery.connect(addr2).commit(commitment2, { value: ticketPrice });
            await ethers.provider.send("evm_increaseTime", [roundDuration + 1]);
            await ethers.provider.send("evm_mine", []);
            await lottery.connect(addr1).reveal(1234, ethers.encodeBytes32String("secret1"));
            await lottery.connect(addr2).reveal(5678, ethers.encodeBytes32String("secret2"));
            
        });

        it("should allow the owner to draw the winner", async function () {
            await ethers.provider.send("evm_increaseTime", [revealDuration + 1]);
            await ethers.provider.send("evm_mine", []);
            const tx = await lottery.connect(owner).drawWinner();
            const receipt = await tx.wait();
            const winnerEvent = receipt.logs.find(event => event.fragment.name === "WinnerSelected");
            const winner = winnerEvent.args.winner;
            expect([addr1.address, addr2.address]).to.include(winner);
            const winnerBalance = await ethers.provider.getBalance(winner);
            console.log({winnerBalance})
            expect(winnerBalance).to.equal(ethers.parseEther("10000") + (ticketPrice * 2n)); // 10000 ETH initial balance + 0.2 ETH winnings
        });

        it("should reject drawing winner before reveal phase ends", async function () {
            await ethers.provider.send("evm_increaseTime", [1]);
            await ethers.provider.send("evm_mine", []);
            await expect(lottery.connect(owner).drawWinner()).to.be.revertedWith("The reveal phase is not over yet.");
        });
    });

    describe("Starting New Round", function () {
        beforeEach(async function () {
            const commitment1 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [1234, ethers.encodeBytes32String("secret1")]));
            const commitment2 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [5678, ethers.encodeBytes32String("secret2")]));
            await lottery.connect(addr1).commit(commitment1, { value: ticketPrice });
            await lottery.connect(addr2).commit(commitment2, { value: ticketPrice });
            await ethers.provider.send("evm_increaseTime", [roundDuration + 1]);
            await ethers.provider.send("evm_mine", []);
            await lottery.connect(addr1).reveal(1234, ethers.encodeBytes32String("secret1"));
            await lottery.connect(addr2).reveal(5678, ethers.encodeBytes32String("secret2"));
            await ethers.provider.send("evm_increaseTime", [revealDuration + 1]);
            await ethers.provider.send("evm_mine", []);
            
        });

        it("should allow the owner to start a new round", async function () {
            await lottery.connect(owner).drawWinner();
            await lottery.connect(owner).startNewRound(roundDuration, revealDuration);
            expect(await lottery.roundEndTimestamp()).to.be.gt(Math.floor(Date.now() / 1000));
            expect(await lottery.revealEndTimestamp()).to.be.gt(await lottery.roundEndTimestamp());
        });

        it("should reject starting a new round if the previous round is ongoing", async function () {
            await expect(lottery.connect(owner).startNewRound(roundDuration, revealDuration)).to.be.revertedWith("Previous round is still ongoing.");
        });
    });
});
