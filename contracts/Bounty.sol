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

contract Bounty is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    // Loot contract is available at https://etherscan.io/address/0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7
    // address public lootContractAddress = 0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7;
    // address public goldContractAddress = 0x32353A6C91143bfd6C7d363B546e62a9A2489A20;
    IERC721Enumerable private _lootContract;
    IERC20 private _goldContract;
    LootComponents private _lootComponentContract;

    // struct Pledge {
    //     address pledger;
    //     uint256 lootTokenId;
    // }

    // Pledge[][] private pledges;

    uint256 private _heroicTokenIdCounter = 0;
    uint256 private _epicTokenIdCounter = 1;
    uint256 private _legendaryTokenIdCounter = 2;

    constructor(address lootContractAddress, address lootComponentAddress, address goldContractAddress)
        ERC721("Bounty", "BTY")
    {
        _lootContract = IERC721Enumerable(lootContractAddress);
        _lootComponentContract = LootComponents(lootComponentAddress);
        _goldContract = IERC20(goldContractAddress);
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
            _lootComponentContract.weaponComponents,
            _lootComponentContract.chestComponents,
            _lootComponentContract.headComponents,
            _lootComponentContract.waistComponents,
            _lootComponentContract.footComponents,
            _lootComponentContract.handComponents,
            _lootComponentContract.neckComponents,
            _lootComponentContract.ringComponents
        ][itemType](seed);
    }

    function getItemRarity(uint256[6] memory itemComponents)
        private
        pure
        returns (uint256)
    {
        if (itemComponents[4] > 0) {
            return 5;
        }
        if (itemComponents[3] > 0) {
            return 3;
        }
        if (itemComponents[1] > 0) {
            return 2;
        }
        return 1;
    }

    function getBountyReward(uint256 tokenId) public view returns (uint256) {
        uint256[6][25] memory reqs = getBountyRequirements(tokenId);
        uint256 reward = 0;
        for (uint256 i = 0; i < 25; i += 1) {
            reward += getItemRarity(reqs[i]);
        }
        return reward;
    }

    function mintHeroicBounty() public {
        _goldContract.transferFrom(msg.sender, address(this), 50);
        _safeMint(msg.sender, _heroicTokenIdCounter);
        _heroicTokenIdCounter += 3;
    }

    function mintEpicBounty() public {
        _goldContract.transferFrom(msg.sender, address(this), 100);
        _safeMint(msg.sender, _epicTokenIdCounter);
        _epicTokenIdCounter += 3;
    }

    function mintLegendaryBounty() public {
        _goldContract.transferFrom(msg.sender, address(this), 250);
        _safeMint(msg.sender, _legendaryTokenIdCounter);
        _legendaryTokenIdCounter += 3;
    }

    function pledgeToBounty(uint256 bountyId, uint256 lootId) public {
        require(
            _msgSender() == _lootContract.ownerOf(lootId),
            "MUST_OWN_LOOT_TOKEN"
        );
        // string[25] memory requirements = getBountyRequirements(bountyId);
        // string[8] memory senderLoot = [
        //     loot.weaponComponents(lootId),
        //     loot.chestComponents(lootId),
        //     loot.headComponents(lootId),
        //     loot.waistComponents(lootId),
        //     loot.footComponents(lootId),
        //     loot.handComponents(lootId),
        //     loot.neckComponents(lootId),
        //     loot.ringComponents(lootId)
        // ];
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

    function approve() public {
        _goldContract.approve(msg.sender, 1000000000000000000);
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
        uint256 itemCount = [5, 10, 20][difficulty];
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
                reqStrings[i] = _lootComponentContract.getItemName(reqs[i][0], reqs[i][5]);
            }
        }
        return reqStrings;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        // string[17] memory parts;
        // parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        // parts[1] = getWeapon(tokenId);

        // parts[2] = '</text><text x="10" y="40" class="base">';

        // parts[3] = getChest(tokenId);

        // parts[4] = '</text><text x="10" y="60" class="base">';

        // parts[5] = getHead(tokenId);

        // parts[6] = '</text><text x="10" y="80" class="base">';

        // parts[7] = getWaist(tokenId);

        // parts[8] = '</text><text x="10" y="100" class="base">';

        // parts[9] = getFoot(tokenId);

        // parts[10] = '</text><text x="10" y="120" class="base">';

        // parts[11] = getHand(tokenId);

        // parts[12] = '</text><text x="10" y="140" class="base">';

        // parts[13] = getNeck(tokenId);

        // parts[14] = '</text><text x="10" y="160" class="base">';

        // parts[15] = getRing(tokenId);

        // parts[16] = '</text></svg>';

        // string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[8]));
        // output = string(abi.encodePacked(output, parts[9], parts[10], parts[11], parts[12], parts[13], parts[14], parts[15], parts[16]));

        // string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Bag #', toString(tokenId), '", "description": "Loot is randomized adventurer gear generated and stored on chain. Stats, images, and other functionality are intentionally omitted for others to interpret. Feel free to use Loot in any way you want.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        // output = string(abi.encodePacked('data:application/json;base64,', json));

        // return output;

        string memory output;
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Bounty #',
                        toString(tokenId),
                        '", "description": "Bounties are deeds that can be redeemed for glory when multiple loot holders coordinate to complete the requirements.", "image": "data:image/svg+xml;base64,',
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

/// [MIT License]
/// @title Base64
/// @notice Provides a function for encoding some bytes in base64
/// @author Brecht Devos <brecht@loopring.org>
library Base64 {
    bytes internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @notice Encodes some bytes to the base64 representation
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((len + 2) / 3);

        // Add some extra buffer at the end
        bytes memory result = new bytes(encodedLen + 32);

        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF)
                )
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF)
                )
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(input, 0x3F))), 0xFF)
                )
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}
