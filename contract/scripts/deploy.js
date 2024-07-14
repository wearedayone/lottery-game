const { ethers } = require('hardhat');

const { verifyContract } = require('./utils');

const ticketPrice = ethers.parseEther("0.001");
const roundDuration = 600; // 60 seconds for testing
const revealDuration = 600; // 60 seconds for testing

const main = async () => {
  try {
    console.log('deploying ...');
    const owner = '0x7866Ac3933dCA99b2e9a80F8948344a387a7BF62';
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
