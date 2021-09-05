// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./LootComponents.sol";
import "./Base64.sol";
import "./Glory.sol";

contract Bounty is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    string[] Prefixes = [
        "VENGEFUL",
        "CORRUPTED",
        "RAVENOUS",
        "FORSAKEN",
        "INFERNAL",
        "POSSESSED",
        "VICIOUS",
        "RABID",
        "MADDENED",
        "BLOODTHIRSTY",
        "PUTRID",
        "GRISLY",
        "MUTANT",
        "SAVAGE",
        "WRETCHED",
        "FERAL",
        "ANCIENT",
        "BEWITCHED"
    ];

    string[] HeroicMonsters = [
        "RAPTOR",
        "MANDRAGORA",
        "SALAMANDER",
        "FIEND",
        "BANSHEE",
        "PHOENIX",
        "ICE SPIDER",
        "LEPRECHAUN",
        "IMP",
        "SABRETOOTH",
        "TROLL",
        "DRAUGR",
        "ZOMBIE",
        "GHOUL",
        "GHOST",
        "HELLHOUND",
        "DEEP GNOME",
        "GOBLIN",
        "SATYR",
        "KOBOLD",
        "DRYAD",
        "ORC",
        "WIGHT",
        "YETI",
        "SPIDER MONKEY"
    ];

    string[] EpicMonsters = [
        "OWLBEAR",
        "HAG",
        "OGRE",
        "SEA SERPENT",
        "WITCH",
        "WRAITH",
        "WURM",
        "WYVERN",
        "GRIFFIN",
        "HIPPOGRIFF",
        "BUGBEAR",
        "INCUBUS",
        "DEMON",
        "CHUPACABRA",
        "ALIEN",
        "VAMPIRE",
        "WEREWOLF",
        "SASQUATCH",
        "ENT",
        "CENTAUR",
        "COCKATRICE",
        "GOLEM",
        "DARK ELF",
        "HOBGOBLIN",
        "MINOTAUR",
        "NECROMANCER",
        "STONE GIANT",
        "FROST GIANT",
        "HILL GIANT"
    ];

    string[] LegendaryMonsters = [
        "DRAGON",
        "BASILISK",
        "DRAGON TURTLE",
        "MANBEARPIG",
        "LEVIATHAN",
        "CHIMERA",
        "HYDRA",
        "SPHINX",
        "GORGON",
        "ABADDON",
        "KRAKEN",
        "MANTICORE",
        "PIT FIEND",
        "CLOUD GIANT",
        "STORM GIANT",
        "FIRE GIANT",
        "MEDUSA",
        "ARCHMAGE",
        "LICH",
        "DJINN",
        "REVENANT",
        "DEVOURER"
    ];

    // Loot contract is available at https://etherscan.io/address/0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7
    // address public lootContractAddress = 0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7;
    // address public goldContractAddress = 0x32353A6C91143bfd6C7d363B546e62a9A2489A20;
    IERC721Enumerable private _lootContract;
    IERC20 private _goldContract;
    GloryForAdventurers private _gloryContract;
    LootComponents private _lootComponentsContract;

    // Pledges are stored as such: lootTokensPledged[bountyId][pledgeNum] = lootTokenId
    uint256[][] private lootTokensPledged;
    uint256 private maxTokenCounter = 0;

    uint256 private _heroicTokenIdCounter = 0;
    uint256 private _epicTokenIdCounter = 1;
    uint256 private _legendaryTokenIdCounter = 2;

    uint256 private _heroicItemRolls = 5;
    uint256 private _epicItemRolls = 10;
    uint256 private _legendaryItemRolls = 20;

    uint256 private _heroicBountyGoldCost = 50;
    uint256 private _epicBountyGoldCost = 100;
    uint256 private _legendaryBountyGoldCost = 200;

    // TODO: Use itemRoll constants

    // TODO: Add ERC20 and ownermint

    constructor(address lootContractAddress, address lootComponentAddress, address goldContractAddress, address gloryContractAddress)
        ERC721("Bounties (For Adventurers)", "BTY")
    {
        _lootContract = IERC721Enumerable(lootContractAddress);
        _lootComponentsContract = LootComponents(lootComponentAddress);
        _goldContract = IERC20(goldContractAddress);
        _goldContract.approve(address(this), 999999999999 * 10 ** 18);
        _gloryContract = GloryForAdventurers(gloryContractAddress);
    }

    function getReward(uint256 tokenId) public pure returns(uint256) {
        return [1000, 3000, 10000][getDifficulty(tokenId)];
    }

    function getRandomItem(uint8 itemNum, uint256 tokenId)
        private
        view
        returns (uint256[6] memory)
    {
        uint256 rand = random(
            string(abi.encodePacked(toString(itemNum), toString(tokenId)))
        );
        uint256 itemType = rand % 8;
        uint256 seed = tokenId * itemNum;
        return
        [
            _lootComponentsContract.weaponComponents,
            _lootComponentsContract.chestComponents,
            _lootComponentsContract.headComponents,
            _lootComponentsContract.waistComponents,
            _lootComponentsContract.footComponents,
            _lootComponentsContract.handComponents,
            _lootComponentsContract.neckComponents,
            _lootComponentsContract.ringComponents
        ][itemType](seed);
    }

    function getBountyMonster(uint256 tokenId) public view returns (string memory) {
        uint256 rand1 = random(
            string(abi.encodePacked(toString(tokenId)))
        );
        uint256 rand2 = random(
            string(abi.encodePacked(toString(tokenId * tokenId)))
        );
        uint256 difficulty = getDifficulty(tokenId);
        uint256 prefixIndex = rand1 % Prefixes.length;
        uint256 monsterIndex;
        if (difficulty == 0) {
            monsterIndex = rand2 % HeroicMonsters.length;
            return string(abi.encodePacked(Prefixes[prefixIndex], ' ', HeroicMonsters[monsterIndex]));
        }
        if (difficulty == 1) {
            monsterIndex = rand2 % EpicMonsters.length;
            return string(abi.encodePacked(Prefixes[prefixIndex], ' ', EpicMonsters[monsterIndex]));
        }
        monsterIndex = rand2 % LegendaryMonsters.length;
        return string(abi.encodePacked(Prefixes[prefixIndex], ' ', LegendaryMonsters[monsterIndex]));
    }

    function mintHeroicBounty() public {
        _goldContract.transferFrom(msg.sender, address(this), _heroicBountyGoldCost * 10 ** 18);
        _safeMint(msg.sender, _heroicTokenIdCounter);
        if (maxTokenCounter <= _heroicTokenIdCounter) {
            for (uint i = maxTokenCounter; i <= _heroicTokenIdCounter; i += 1) {
                // I literally don't know how to make this work without
                // initializing with a non-empty array so fuck it
                lootTokensPledged.push([0]);
                maxTokenCounter += 1;
            }
        }
        _heroicTokenIdCounter += 3;
    }

    function mintEpicBounty() public {
        _goldContract.transferFrom(msg.sender, address(this), _epicBountyGoldCost * 10 ** 18);
        _safeMint(msg.sender, _epicTokenIdCounter);
        if (maxTokenCounter <= _epicTokenIdCounter) {
            for (uint i = maxTokenCounter; i <= _epicTokenIdCounter; i += 1) {
                lootTokensPledged.push([0]);
                maxTokenCounter += 1;
            }
        }
        _epicTokenIdCounter += 3;
    }

    function mintLegendaryBounty() public {
        _goldContract.transferFrom(msg.sender, address(this), _legendaryBountyGoldCost * 10 ** 18);
        _safeMint(msg.sender, _legendaryTokenIdCounter);
        if (maxTokenCounter <= _legendaryTokenIdCounter) {
            for (uint i = maxTokenCounter; i <= _legendaryTokenIdCounter; i += 1) {
                lootTokensPledged.push([0]);
                maxTokenCounter += 1;
            }
        }
        _legendaryTokenIdCounter += 3;
    }

    function isMinted(uint256 tokenId) public view returns (bool) {
        return [
            _heroicTokenIdCounter,
            _epicTokenIdCounter,
            _legendaryTokenIdCounter
        ][getDifficulty(tokenId)] > tokenId;
    }

    function getItemSlotForTokenId(uint256 itemSlot, uint256 tokenId) private view returns (uint256[6] memory) {
        require(itemSlot > 0, 'ITEM_SLOT_MUST_BE_GREATER_THAN_ZERO');
        return [
            _lootComponentsContract.weaponComponents,
            _lootComponentsContract.chestComponents,
            _lootComponentsContract.headComponents,
            _lootComponentsContract.waistComponents,
            _lootComponentsContract.footComponents,
            _lootComponentsContract.handComponents,
            _lootComponentsContract.neckComponents,
            _lootComponentsContract.ringComponents
        ][itemSlot - 1](tokenId);
    }

    function getComponentsRemaining(uint256 tokenId) public view returns(uint256[6][25] memory) {
        require(isMinted(tokenId), 'BOUNTY_NOT_MINTED');

        uint256[6][25] memory requiredItems = getBountyRequirements(tokenId);
        bool[25] memory isItemPledged;
        for (uint256 itemNum = 0; itemNum < 25; itemNum += 1) {
            uint256[] memory pledgedLoots = lootTokensPledged[tokenId];
            uint256[6] memory requiredItem = requiredItems[itemNum];

            // Skip if empty requirement
            if (requiredItem[5] == 0) {
                isItemPledged[itemNum] = true;
                continue;
            }

            for (uint256 lootNum = 1; lootNum < pledgedLoots.length; lootNum += 1) {
                uint256 pledgedLootId = pledgedLoots[lootNum];
                uint256[6] memory pledgedItem = getItemSlotForTokenId(requiredItem[5], pledgedLootId);
                if (pledgedItem[0] == requiredItem[0]) {
                    isItemPledged[itemNum] = true;
                }
            }
        }

        uint256[6][25] memory componentsRemaining;
        for (uint256 i = 0; i < 25; i += 1) {
            if (!isItemPledged[i]) {
                componentsRemaining[i] = requiredItems[i];
            }
        }

        return componentsRemaining;
    }

    function getItemsRemaining(uint256 tokenId) public view returns(string[25] memory) {
        require(isMinted(tokenId), 'BOUNTY_NOT_MINTED');

        uint256[6][25] memory componentsRemaining = getComponentsRemaining(tokenId);
        string[25] memory itemsRemaining;
        for (uint256 i = 0; i < 25; i += 1) {
            if (componentsRemaining[i][5] > 0) {
                itemsRemaining[i] = _lootComponentsContract.getItemName(componentsRemaining[i][0], componentsRemaining[i][5]);
            }
        }

        return itemsRemaining;
    }

    function areBountyRequirementsMet(uint256 tokenId) public view returns (bool) {
        string[25] memory itemsRemaining = getItemsRemaining(tokenId);

        for (uint256 i = 0; i < 25; i += 1) {
            if (bytes(itemsRemaining[i]).length > 0) {
                return false;
            }
        }

        return true;
    }

    function completeBounty(uint256 tokenId) public {
        require(
            _msgSender() == ownerOf(tokenId),
            "MUST_OWN_BOUNTY_TOKEN"
        );
        require(
            areBountyRequirementsMet(tokenId),
            "BOUNTY_REQUIREMENTS_NOT_MET"
        );

        uint256 goldAmount = [_heroicBountyGoldCost, _epicBountyGoldCost, _legendaryBountyGoldCost][getDifficulty(tokenId)];
        
        _goldContract.transferFrom(address(this), msg.sender, goldAmount * 10 ** 18);
        // Mint GLORY
        uint256 reward = getReward(tokenId);
        uint256 numRecipients = lootTokensPledged[tokenId].length;
        uint256 rewardPerRecipient = reward / numRecipients;

        _gloryContract.mint(msg.sender, rewardPerRecipient);
        for (uint256 i = 1; i < numRecipients; i += 1) {
            _gloryContract.mint(_lootContract.ownerOf(lootTokensPledged[tokenId][i]), rewardPerRecipient);
        }

        _burn(tokenId);

        // TODO: completion logic
        // Return AGLD
        // Burn Bounty
        // Mint Trophy?
    }

    function pledgeLootToBounty(uint256 lootTokenId, uint256 bountyTokenId) public {
        require(isMinted(bountyTokenId), 'BOUNTY_NOT_MINTED');
        require(
            _msgSender() == _lootContract.ownerOf(lootTokenId),
            "MUST_OWN_LOOT_TOKEN"
        );
        for (uint256 i = 1; i < lootTokensPledged[bountyTokenId].length; i += 1) {
            require(lootTokenId != lootTokensPledged[bountyTokenId][i], 'LOOT_ALREADY_PLEDGED');
        }

        // TODO: Enforce loot requirement
        uint256[6][25] memory requiredItems = getComponentsRemaining(bountyTokenId);
        bool hasRequiredLoot = false;
        for  (uint i = 0; i < 25; i += 1) {
            uint256[6] memory requiredItem = requiredItems[i];
            if (requiredItem[5] == 0) {
                continue;
            }
            uint256[6] memory lootItem = getItemSlotForTokenId(requiredItem[5], lootTokenId);
            if (requiredItem[0] == lootItem[0]) {
                hasRequiredLoot = true;
                break;
            }
        }
        require(hasRequiredLoot, 'LOOT_MUST_CONTAIN_UNMET_ITEM_REQUIREMENT');

        lootTokensPledged[bountyTokenId].push(lootTokenId);
    }

    function compareItems(uint256[6] memory item1, uint256[6] memory item2)
        private
        pure
        returns (bool)
    {
        return
            item1[0] == item2[0] &&
            item1[1] == item2[1] &&
            item1[2] == item2[2] &&
            item1[3] == item2[3] &&
            item1[4] == item2[4];
    }

    function getDifficulty(uint256 tokenId) internal pure returns (uint256) {
        return tokenId % 3;
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    // Inspired by OraclizeAPI's implementation - MIT license
    // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function getBountyRequirements(uint256 tokenId)
        public
        view
        returns (uint256[6][25] memory)
    {
        uint256 difficulty = getDifficulty(tokenId);
        uint256 itemCount = [6, 12, 24][difficulty];
        uint256[6][25] memory requiredItems;
        for (uint8 i = 0; i < itemCount; i += 1) {
            uint256[6] memory item = getRandomItem(i, tokenId);
            bool isDupe = false;
            for (uint8 j = 0; j < i; j += 1) {
                if (compareItems(item, requiredItems[j])) {
                    isDupe = true;
                    break;
                }
            }
            if (isDupe) {
                continue;
            }
            requiredItems[i] = item;
        }
        return requiredItems;
    }

    function getBountyRequirementsText(uint256 tokenId)
        public
        view
        returns (string[25] memory)
    {
        uint256[6][25] memory reqs = getBountyRequirements(tokenId);
        string[25] memory reqStrings;
        for (uint i = 0; i < 25; i += 1) {
            if (reqs[i][5] > 0) {
                reqStrings[i] = _lootComponentsContract.getItemName(reqs[i][0], reqs[i][5]);
            }
        }
        return reqStrings;
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // TODO: Add bounty type to attributes array and name
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        string[31] memory parts;
        string memory monster = getBountyMonster(tokenId);
        string[25] memory itemReqs = this.getBountyRequirementsText(tokenId);
        string memory questType = [unicode' HEROIC ', unicode'n ❗️EPIC❗️ ',  unicode' ‼️LEGENDARY‼️ '][getDifficulty(tokenId)];
        string memory reward = [unicode'𝟙,𝟘𝟘𝟘', unicode'𝟛,𝟘𝟘𝟘', unicode'𝟙𝟘,𝟘𝟘𝟘'][getDifficulty(tokenId)];
        
        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 12px; }</style><rect width="100%" height="100%" fill="black" />';
        parts[1] = string(abi.encodePacked('<text x="10" y="20" class="base">A', questType, 'bounty has been posted to slay the</text><text x="10" y="35" class="base">'));
        parts[2] = monster;
        parts[3] = ' terrorizing our lands!</text><text x="10" y="70" class="base">';
        parts[4] = 'To complete the bounty, gather your fellow adventurers</text><text x="10" y="85" class="base">who hold the required items:</text>';

        uint256 line = 0;
        uint256 xPos = 10;
        for (uint256 i = 0; i < 25; i += 1) {
            uint256 partNum = i + 5;
            if (bytes(itemReqs[i]).length != 0) {
                uint256 yPos = (line * 15) + 120;
                parts[partNum] = string(abi.encodePacked('<text x="', uint2str(xPos),'" y="', uint2str(yPos), '" class="base">', itemReqs[i], '</text>'));
                if (line == 10) {
                    line = 0;
                    xPos = 165;
                } else {
                    line += 1;
                }
            } else {
                parts[partNum] = '';
            }
        }

        parts[30] = string(abi.encodePacked(unicode'<text x="10" y="330" class="base">A reward of ✨', reward, unicode' 𝔾𝕃𝕆ℝ𝕐✨ shall be split among the party.</text></svg>'));
        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[8]));
        output = string(abi.encodePacked(output, parts[9], parts[10], parts[11], parts[12], parts[13], parts[14], parts[15], parts[16]));
        output = string(abi.encodePacked(output, parts[17], parts[18], parts[19], parts[20], parts[21], parts[22], parts[23], parts[24]));
        output = string(abi.encodePacked(output, parts[25], parts[26], parts[27], parts[28], parts[29], parts[30]));

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Bounty #',
                        toString(tokenId),
                        '", "description": "Bounties can be redeemed for glory when multiple adventurers coordinate to complete the requirements.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(output)),
                        '"}'
                    )
                )
            )
        );
        return json;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}

