// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Characters is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    struct Personage {
        string name;
        bytes32 characteristics;
        bytes32 proofOfChoices;
    }
    Personage[] characters;
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}
    function MintPersonage(address _player, string memory _tokenURI, string memory _name ,bytes32 _characteristics, bytes32 _proofOfChoices) public returns (uint256)
    {
        characters.push(Personage(_name,_characteristics, _proofOfChoices));
        uint256 newItemId = _tokenIds.current();
        _tokenIds.increment();
        _safeMint(_player, newItemId);
        _setTokenURI(newItemId, _tokenURI);
 
        return newItemId;
    }

    function setProofOfChoices(uint256 _tokenId,bytes32 _proofOfChoices) external {
        characters[_tokenId].proofOfChoices = _proofOfChoices;
    }

    function getPersonnage(uint256 _tokenId) external view returns(Personage memory personage_){
        return characters[_tokenId];
    }
    function getAllPersonages() external view returns(Personage[] memory characters_){
        return characters;
    }

    function madeIsChoice(string memory _choice, bytes32[] calldata _proof, uint256 _tokenId) external view returns(bool) {
        return _verify(leaf(_choice),characters[_tokenId].proofOfChoices ,_proof);
    }

    function hasThisCharacteristic(string memory _choice, bytes32[] calldata _proof, uint256 _tokenId) external view returns(bool) {
        return _verify(leaf(_choice),characters[_tokenId].characteristics ,_proof);
    }
    
    function leaf(string memory _choise) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(_choise));
    }

    function _verify(bytes32 _leaf,bytes32 _merkleRoot,bytes32[] memory _proof) internal pure returns(bool) {
        return MerkleProof.verify(_proof, _merkleRoot, _leaf);
    }
}