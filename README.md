# LOTTERY GAME

1. Game logic:
- Game is running by round. Each round have time duration for player to buy ticket & reveal ticket
- After round started, on phase 1, player will buy ticket to guess number. On phase 2, player have to reveal their bought ticket.
- When round end, admin will generate random number and who guess nearest is winner

2. Deployment
2.1. Deploy smart contract
- update private key in hardhat.config.js [line 37]
- update owner address in scripts/deploy.js [line 12]
- run script: 'yarn install' & 'yarn deploy' to deploy contract to sepolia network
- copy smart contract address and update frontend .env

2.2. Start frontend
- update .env file using smart contract address from last step
- run 'yarn start'

2.3. Game admin
- Admin manage start new round and select winner from etherscan

3. Note:
- Free to deploy smart contract to any other L1/L2 chain

4. Frontend improvements
- Add styling library such as Material Design
- Organize styling/css into styling components
- Separate codebase into multiple components - components/button, components/input etc...
- Add Typescript to support typings
- Separate wallet connectivity functionalities to separate service
- Organize codebase in multiple components - PlayerActions, Game Stats, Results
- Cover all components and functionalities with unit & e2e tests
- Add CI/CD scripts automate build and deployment steps

5. Game admin improvements
- Consider creating UI for admin controls of the Game
