const { ethers } = require('hardhat');

const { verifyContract } = require('./utils');

const ticketPrice = ethers.parseEther("0.001");
// const roundDuration = 600; // 60 seconds for testing
// const revealDuration = 600; // 60 seconds for testing

const main = async () => {
  try {
    console.log('deploying ...');
    const owner = '0x18e188AfcFc7A1521ed116a903bEAC4A230Aa718';
    const CommitRevealLottery = await ethers.getContractFactory('CommitRevealLottery');
    const CommitRevealLotteryContract = await CommitRevealLottery.deploy(owner, ticketPrice);
    const gameAddress = await CommitRevealLotteryContract.getAddress();

    await verifyContract({ address: gameAddress, constructorArguments: [owner, ticketPrice] });

    console.log(`Contract is deployed to ${gameAddress}`);
  } catch (err) {
    console.error(err);
  }

  process.exit();
};

main();
