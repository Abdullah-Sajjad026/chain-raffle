// A decentralized raffle contract

/*
    A user enters by sending a certain amount of ether to the contract. An event is emitted when a
    user enters the raffle. We count the number of players that have entered the raffle.

    We pick a winner when interval has passed, players count is above 0, raffle state is open.

    VRF works in two steps. First we request randomness in some of our function through vrfcoordinatorv2.
    Then we need a fulfillRandomWords function that will be called by chainlink when the randomness is
    generated. We use the random number to pick a winner and transfer the entire balance to the winner.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// imports
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Raffle__LowEntranceFee();
error Raffle__NotOpen();
error Raffle_TransferFailed();

/**
 * @title Raffle
 * @author Abdullah-Sajjad026
 * @notice A decentralized raffle contract where users can enter by sending a certain amount of ether
 * @dev This contract uses Chainlink VRF to generate a random number and Chainlink Keepers to automate the process of picking a winner
 */
contract Raffle is VRFConsumerBaseV2 {
    // Types
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    // State Variables
    address payable[] private s_players;
    uint256 private immutable i_entranceFee;

    // VRFCoordiantorV2 Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_gasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint16 private constant NUM_WORDS = 1;

    // Raffle Variables
    RaffleState private raffleState;
    address private recentWinner;
    uint256 private lastTimeStamp;
    uint256 private immutable i_interval;

    // Events
    event RaffleEntered(address indexed _entrant, uint256 _timeStamp);
    event RequestedRandomness(bytes32 indexed _requestId);
    event PickedRaffleWinner(
        address indexed _winner,
        uint256 _timeStamp,
        uint256 _amount
    );

    // Constructor
    constructor(
        uint256 _entranceFee,
        uint256 _interval,
        // coordinator params
        address _vrfCoordinatorV2Address,
        bytes32 _gasLane,
        uint64 _subscriptionId,
        uint32 _gasLimit
    ) VRFConsumerBaseV2(_vrfCoordinatorV2Address) {
        i_entranceFee = _entranceFee;
        i_interval = _interval;

        raffleState = RaffleState.OPEN;
        lastTimeStamp = block.timestamp;

        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinatorV2Address);
        i_gasLane = _gasLane;
        i_subscriptionId = _subscriptionId;
        i_gasLimit = _gasLimit;
    }

    /**
     * @notice Enter the player to raffle
     */
    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__LowEntranceFee();
        }

        if (raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }

        s_players.push(payable(msg.sender));
        emit RaffleEntered(msg.sender, block.timestamp);
    }

    function pickWinner() public {
        raffleState = RaffleState.CALCULATING;

        // request randomness from chainlink
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_gasLimit,
            NUM_WORDS
        );
        emit RequestedRandomness(bytes32(requestId));
    }

    /**
     *  @notice Callback function used by VRF Coordinator to return the random number
     */
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory _randomWords
    ) internal override {
        // getting a random number in the range of players count
        uint256 randomNumber = _randomWords[0] % s_players.length;

        address payable winner = s_players[randomNumber];
        uint256 wonAmount = address(this).balance;
        // transfer the entire balance to the winner
        (bool success, ) = winner.call{value: wonAmount}("");

        if (!success) {
            revert Raffle_TransferFailed();
        }

        recentWinner = winner;
        lastTimeStamp = block.timestamp;
        raffleState = RaffleState.OPEN;
        emit PickedRaffleWinner(winner, block.timestamp, wonAmount);
    }

    // Getters
    /**
     * @notice Get entrance fee for entering the raffle
     */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    /**
     * @notice Get the players that have entered the raffle
     */
    function getPlayers() public view returns (address payable[] memory) {
        return s_players;
    }

    /**
     * @notice Get the current raffle state
     */
    function getRaffleState() public view returns (RaffleState) {
        return raffleState;
    }

    /**
     * @notice Get the recent winner of the raffle
     */
    function getRecentWinner() public view returns (address) {
        return recentWinner;
    }

    /**
     * @notice Get the interval for the raffle
     */
    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    /**
     * @notice Get the timestamp when raffle was last drawn
     */
    function getLastDrawTime() public view returns (uint256) {
        return lastTimeStamp;
    }
}
