// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

contract CommitRevealLottery is Ownable {
  using EnumerableSet for EnumerableSet.AddressSet;

  struct Player {
    bytes32 commitment;
    uint256 guess;
  }

  EnumerableSet.AddressSet private players;
  mapping(address => Player) public playerData;
  address public recentWinner;
  uint256 public ticketPrice;
  uint256 public roundEndTimestamp;
  uint256 public revealEndTimestamp;
  bool public roundStarted;

  event TicketPurchased(address indexed player, bytes32 commitment);
  event WinnerSelected(address indexed winner);

  constructor(
    address initialOwner,
    uint256 _ticketPrice,
    uint256 _roundDuration,
    uint256 _revealDuration
  ) Ownable(initialOwner) {
    ticketPrice = _ticketPrice;
    roundEndTimestamp = block.timestamp + _roundDuration;
    revealEndTimestamp = roundEndTimestamp + _revealDuration;
    roundStarted = true;
  }

  function commit(bytes32 _commitment) public payable {
    require(msg.value == ticketPrice, 'Incorrect ticket price.');
    require(block.timestamp < roundEndTimestamp, 'The commit phase has ended.');
    require(playerData[msg.sender].commitment == 0, 'Already committed.');

    playerData[msg.sender] = Player(_commitment, 0);
    players.add(msg.sender);

    emit TicketPurchased(msg.sender, _commitment);
  }

  function reveal(uint256 _guess, bytes32 _blindingFactor) public {
    require(block.timestamp >= roundEndTimestamp, 'The reveal phase has not started.');
    require(block.timestamp < revealEndTimestamp, 'The reveal phase has ended.');
    require(playerData[msg.sender].commitment != 0, 'No commitment found.');
    require(
      keccak256(abi.encodePacked(_guess, _blindingFactor)) == playerData[msg.sender].commitment,
      'Invalid reveal.'
    );

    playerData[msg.sender].guess = _guess;
  }

  function drawWinner() public onlyOwner {
    require(block.timestamp >= revealEndTimestamp, 'The reveal phase is not over yet.');
    require(players.length() > 0, 'No players in the game.');

    uint256 winningNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % players.length();
    address winner;
    uint256 minDiff = type(uint256).max;

    for (uint256 i = 0; i < players.length(); i++) {
      address player = players.at(i);
      uint256 guess = playerData[player].guess;
      uint256 diff = guess > winningNumber ? guess - winningNumber : winningNumber - guess;
      if (diff < minDiff) {
        minDiff = diff;
        winner = player;
      }
    }

    recentWinner = winner;
    payable(winner).transfer(address(this).balance);
    emit WinnerSelected(winner);

    // Reset the game
    for (uint256 i = 0; i < players.length(); i++) {
      address player = players.at(i);
      delete playerData[player];
    }
    // Clear the set of players
    while (players.length() > 0) {
      players.remove(players.at(0));
    }
    roundStarted = false;
  }

  function startNewRound(uint256 _roundDuration, uint256 _revealDuration) public onlyOwner {
    require(!roundStarted, 'Previous round is still ongoing.');
    roundEndTimestamp = block.timestamp + _roundDuration;
    revealEndTimestamp = roundEndTimestamp + _revealDuration;
    roundStarted = true;
  }

  function getPlayers() public view returns (address[] memory) {
    return players.values();
  }

  receive() external payable {}
}
