const { ethers } = require('hardhat');

const { verifyContract } = require('./utils');

const ticketPrice = ethers.parseEther("0.001");
const roundDuration = 60; // 600 seconds for testing
const revealDuration = 60; // 600 seconds for testing

const main = async () => {
  try {
    console.log('deploying ...');
    const owner = '0x80a3fae8092A278fEDBD80f9eceC215072bdDd4B';
    const CommitRevealLottery = await ethers.getContractFactory('CommitRevealLottery');
    const CommitRevealLotteryContract = await CommitRevealLottery.deploy(owner, ticketPrice, roundDuration, revealDuration);
    const gameAddress = await CommitRevealLotteryContract.getAddress();

    await verifyContract({ address: gameAddress, constructorArguments: [owner, ticketPrice, roundDuration, revealDuration] });


    console.log(`NFT is deployed to ${gameAddress}`);
  } catch (err) {
    console.error(err);
  }

  process.exit();
};

main();
