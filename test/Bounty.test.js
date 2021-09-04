// Set up a Truffle contract, representing our deployed Box instance
const Gold = artifacts.require('AdventureGold');
const Loot = artifacts.require('Loot');
const Bounty = artifacts.require('Bounty');

// // scripts/index.js
// module.exports = async function main (callback) {
//   try {
//     // Our code will go here
//     const gold = await Gold.deployed();
//     const loot = await Loot.deployed();
//     const bounty = await Bounty.deployed();

//     // gold.daoSetLootContractAddress(loot.address);

//     // console.log(await loot.claim(123));
//     // console.log(await gold.claimById(123));
//     // console.log(await bounty.approve());
//     // console.log(await bounty.mintLegendaryBounty());
//     // console.log(await bounty.balanceOf(accounts[0]));

//     console.log(await bounty.getBountyRequirements(0));
//     console.log(await bounty.getBountyReward(0));
//     console.log(await bounty.getBountyRequirements(1));
//     console.log(await bounty.getBountyReward(1));
//     console.log(await bounty.getBountyRequirements(2));
//     console.log(await bounty.getBountyReward(2));
//     callback(0);
//   } catch (error) {
//     console.error(error);
//     callback(1);
//   }
// };

contract("Bounty", accounts => {
  let bounty;

  beforeEach(async () => {
    bounty = await Bounty.deployed();
  });

  describe('getBountyRequirements()', () => {
    it('0', async () => {
      console.log(await debug(bounty.getBountyRequirements(0)));
    });
  });
});