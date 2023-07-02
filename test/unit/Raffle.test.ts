import { deployments, ethers, network } from "hardhat";
import { developmentChains, networksConfig } from "../../helper-hardhat-config";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";
import { BigNumberish, EventLog } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { request } from "http";

/*
    Based on the contract, we should test following functions to get most of the coverage
    - constructor
    - enterRaffle
    - checkUpkeep
    - performUpkeep
    - fulfillRandomWords
*/

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let accounts: SignerWithAddress[];
      let player: SignerWithAddress;
      let raffleContract: Raffle;
      let raffleContractAddress: string;
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
      let raffle: Raffle;
      let raffleEntranceFee: BigNumberish;
      let interval: number;

      beforeEach(async function () {
        accounts = await ethers.getSigners();
        player = accounts[1];

        // deploy the contracts
        await deployments.fixture();

        vrfCoordinatorV2Mock = (await ethers.getContract(
          "VRFCoordinatorV2Mock"
        )) as VRFCoordinatorV2Mock;
        raffleContract = (await ethers.getContract("Raffle")) as Raffle;
        raffleContractAddress = await raffleContract.getAddress();

        raffle = raffleContract.connect(player);
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = parseInt((await raffle.getInterval()).toString());
      });

      describe("constructor tests", function () {
        it("raffle is initially open", async () => {
          const raffleState = (await raffle.getRaffleState()).toString();
          assert.equal(raffleState, "0");
        });
        it("sets up the interval correctly", async () => {
          // ideally, we'd make this check everything
          assert.equal(
            interval.toString(),
            networksConfig[network.name as keyof typeof networksConfig].interval
          );
        });
      });

      describe("enterRaffle tests", function () {
        /*
                - reverts with error if not enough ETH is sent along
                - records the player if enough ETH is sent along
                - emits event of raffle entrance
                - does not allow entrance if raffle is not open
            */
        it("reverts with error if no amount is sent along", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffleContract,
            "Raffle__LowEntranceFee"
          );
        });

        it("records the player if enough ETH is sent along", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const rafflePlayer = (await raffle.getPlayers())[0];
          assert.equal(rafflePlayer, player.address);
        });

        it("emits event of raffle entrance", async () => {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, "RaffleEntered");
        });

        it("does not allow entrance if raffle is not open", async () => {
          // we need to pass checkUpkeep to change raffle state from open to another
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval + 1]);
          await network.provider.send("evm_mine", []);

          await raffle.performUpkeep("0x");
          // perform upkeep changes the state to calculating
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWithCustomError(raffleContract, "Raffle__NotOpen");
        });
      });

      describe("checkUpkeep tests", function () {
        /*
                - returns true if raffle is open, time has passed and at least one player has entered
            */

        it("returns false if the interval has not passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval - 2]);
          await network.provider.send("evm_mine", []);
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          assert.equal(upKeepNeeded, false);
        });

        it("returns false if no eth is added", async () => {
          await network.provider.send("evm_increaseTime", [interval + 1]);
          await network.provider.send("evm_mine", []);
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          assert.equal(upKeepNeeded, false);
        });

        it("returns false if raffle is not open", async () => {
          // changing the raffle state to calculating
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval + 1]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep("0x");

          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          assert.equal(upKeepNeeded, false);
        });

        it("returns true if raffle is open, time has passed and at least one player has entered", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval + 1]);
          await network.provider.send("evm_mine", []);
          const { upKeepNeeded } = await raffle.checkUpkeep("0x");
          assert.equal(upKeepNeeded, true);
        });
      });

      describe("performUpkeep tests", function () {
        /*
                - reverts if upKeep is not needed
                - can only run if checkUpkeep returns true
                - updates raffle state, emits an event with requestId
        */
        it("reverts if upKeep is not needed", async () => {
          await expect(
            raffle.performUpkeep("0x")
          ).to.be.revertedWithCustomError(
            raffleContract,
            "Raffle__UpKeepNotNeeded"
          );
        });

        it("can only run if checkUpkeep returns true", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval + 1]);
          await network.provider.send("evm_mine", []);

          const tx = await raffle.performUpkeep("0x");
          assert(tx);
        });

        it("updates raffle state, emits an event with requestRandomWords requestId", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval + 1]);
          await network.provider.send("evm_mine", []);

          const tx = await raffle.performUpkeep("0x");
          const txReceipt = await tx.wait();
          const performUpkeepTxLogs = txReceipt?.logs as EventLog[];

          const requestId = performUpkeepTxLogs[1].topics[1];

          const raffleState = (await raffle.getRaffleState()).toString();
          assert.equal(raffleState, "1");
          assert(parseInt(requestId) > 0);
        });
      });

      describe("fulfillRandomWords tests", function () {
        /*
         * make it draw ready before each test by entering and completing the interval
         */

        beforeEach(async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [interval + 1]);
          await network.provider.send("evm_mine", []);
        });

        it("can only be called after performupkeep", async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffleContractAddress)
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleContractAddress)
          ).to.be.revertedWith("nonexistent request");
        });

        // This test is too big...
        // it("picks a winner, resets, and sends money", async () => {
        //   // adding 3 more players
        //   const additionalEntrances = 3;
        //   const startingIndex = 2;
        //   for (
        //     let i = startingIndex;
        //     i < startingIndex + additionalEntrances;
        //     i++
        //   ) {
        //     raffle = raffleContract.connect(accounts[i]);
        //     await raffle.enterRaffle({ value: raffleEntranceFee });
        //   }

        //   // noting starting time stamp
        //   const startingTimeStamp = await raffle.getLastDrawTime();

        //   // This will be more important for our staging tests...
        //   await new Promise<void>(async (resolve, reject) => {
        //     // listening for the event
        //     raffle.on("PickedRaffleWinner", async () => {

        //         console.log("WinnerPicked event fired!")
        //                 // assert throws an error if it fails, so we need to wrap
        //                 // it in a try/catch so that the promise returns event
        //                 // if it fails.
        //                 try {
        //                     // Now lets get the ending values...
        //                     const recentWinner = await raffle.getRecentWinner()
        //                     const raffleState = (await raffle.getRaffleState()).toString()
        //                     const winnerBalance =  await ethers.provider.getBalance(
        //                         accounts[2]
        //                       );
        //                     const endingTimeStamp = await raffle.getLastDrawTime();
        //                     await expect((await raffle.getPlayers()).length === 0)
        //                     assert.equal(recentWinner.toString(), accounts[2].address)
        //                     assert.equal(raffleState, "0")
        //                     // assert.equal(
        //                     //     winnerBalance.toString(),
        //                     //     startingBalance
        //                     //         .add(
        //                     //             raffleEntranceFee
        //                     //                 .mul(additionalEntrances)
        //                     //                 .add(raffleEntranceFee)
        //                     //         )
        //                     //         .toString()
        //                     // )
        //                     assert(endingTimeStamp > startingTimeStamp)
        //                     resolve()
        //                 } catch (e) {
        //                     reject(e)
        //                 }

        //     });

        //     const performUpkeepTx = await raffle.performUpkeep("0x");
        //     const performUpkeepTxReceipt = await performUpkeepTx.wait(1);
        //     const performUpkeepTxLogs =
        //       performUpkeepTxReceipt?.logs as EventLog[];
        //     const requestId = performUpkeepTxLogs[1].topics[1];

        //     const startingBalance = await ethers.provider.getBalance(
        //       accounts[2]
        //     );

        //     await vrfCoordinatorV2Mock.fulfillRandomWords(
        //       requestId,
        //       raffleContractAddress
        //     );
        //   });
        // });
      });
    });
