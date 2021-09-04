// Set up a Truffle contract, representing our deployed Box instance
const Gold = artifacts.require('AdventureGold');
const Loot = artifacts.require('Loot');
const LootComponents = artifacts.require('LootComponents');
const Bounty = artifacts.require('Bounty');

// scripts/index.js
module.exports = async function main (callback) {
  try {
    let accounts = await web3.eth.getAccounts()

    // Our code will go here
    const gold = await Gold.deployed();
    const loot = await Loot.deployed();
    const lootComponents = await LootComponents.deployed();
    const bounty = await Bounty.deployed();

    // console.log(await lootComponents.weaponComponents(1));

    // gold.daoSetLootContractAddress(loot.address);

    // console.log(await loot.claim(123));
    // console.log(await gold.claimById(123));
    // console.log(await bounty.approve());
    // console.log(await bounty.mintLegendaryBounty());
    // console.log(await bounty.balanceOf(accounts[0]));

    // // console.log(await bounty.getBountyRequirements(0));
    // console.log(await bounty.getBountyRequirementsText(0));
    // // console.log(await bounty.getBountyReward(0));
    // console.log(await bounty.getBountyRequirementsText(1));
    // // console.log(await bounty.getBountyReward(1));
    // console.log(await bounty.getBountyRequirementsText(2));
    // // console.log(await bounty.getBountyReward(2));

    await gold.approve(bounty.address, 10000000);
    console.log(await gold.allowance(accounts[0], bounty.address));
    console.log(await bounty.mintHeroicBounty());
    console.log(await bounty.mintEpicBounty());
    console.log(await bounty.mintLegendaryBounty());
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
};