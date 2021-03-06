// migrations/2_deploy.js
const Gold = artifacts.require('AdventureGold');
const Loot = artifacts.require('Loot');
const LootComponents = artifacts.require('LootComponents');
const Bounty = artifacts.require('Bounty');
const Glory = artifacts.require('GloryForAdventurers');

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Loot);
  const loot = await Loot.deployed();
  await deployer.deploy(LootComponents);
  const lootComponents = await LootComponents.deployed();
  await deployer.deploy(Gold, loot.address);
  const gold = await Gold.deployed();
  await deployer.deploy(Glory);
  const glory = await Glory.deployed();
  const bounty = await deployer.deploy(Bounty, loot.address, lootComponents.address, gold.address, glory.address);
  await glory.setBountyAsMinter(bounty.address);
  
  // Test only
  await loot.claim(123);
  await gold.claimById(123);
};
