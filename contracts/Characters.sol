// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Characters
 * @author Sebastien Gazeau
 * @dev Story character manager
 */
contract Characters is ERC721URIStorage {
	using Counters for Counters.Counter;
	Counters.Counter private tokenIds;
	struct Personage {
		bool isReferential;
		bool isTombstone;
		string name;
		bytes32 characteristics;
		bytes32 proofOfChoices;
	}
	Personage[] characters;
	constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}
	/**
	 * @dev modifier to check if caller is an onwer
	 */ 
	modifier isOwner(uint _tokenId) {
		require(msg.sender == ownerOf(_tokenId), "Caller is not authorised");
		_;
	}
	/**
	 * @dev modifier to check if a character is a referential
	 */ 
	modifier isReferential(uint _tokenId) {
		require(characters[_tokenId].isReferential, "character can't be used");
		_;
	}
	/**
	 * @dev mint the first character
	 * @param _tokenURI Uniform Resource Identifier
	 * @param _name name of the character
	 * @param _characteristics characteristics of the character
	 * @param _proofOfChoices choice for the character
	 * @return id_ id of the new token
	 */
	function firstPersonage(string memory _tokenURI, string memory _name ,bytes32 _characteristics, bytes32 _proofOfChoices) external returns (uint256 id_){
		require(characters.length == 0, "Use other function");
		return mintPersonage(msg.sender, true, false,_tokenURI, _name, _characteristics, _proofOfChoices);
	}
	/**
	 * @dev mint the character when all other characters are dead 
	 * @param _tokenURI Uniform Resource Identifier
	 * @param _name name of the character
	 * @param _characteristics characteristics of the character
	 * @param _proofOfChoices choice for the character
	 * @return id_ id of the new token
	 */
	function newAfterDeath(string memory _tokenURI, string memory _name ,bytes32 _characteristics, bytes32 _proofOfChoices) external returns (uint256 id_){
		for (uint i = 0; i < characters.length; i++){
		   require(characters[i].isTombstone, "A character is not dead");
		}
		return mintPersonage(msg.sender, true, false,_tokenURI, _name, _characteristics, _proofOfChoices);
	}    
	/**
	 * @dev mint a tombstone when a characters is dead 
	 * @param _tokenId token id
	 * @param _tokenURI Uniform Resource Identifier
	 * @return id_ id of the new token
	 */
	function deadPersonage(uint256 _tokenId, string memory _tokenURI) external isOwner(_tokenId) isReferential(_tokenId) returns (uint256 id_){
		id_ = mintPersonage(msg.sender, false, true,_tokenURI, characters[_tokenId].name, characters[_tokenId].characteristics, characters[_tokenId].proofOfChoices);
		_burn(_tokenId);
	}
	/**
	 * @dev mint the character when a story is finished
	 * @param _tokenId token id
	 * @param _tokenURI Uniform Resource Identifier
	 * @return id_ id of the new token
	 */
	function endOfStoryPersonage(uint256 _tokenId, string memory _tokenURI) external isOwner(_tokenId) isReferential(_tokenId) returns (uint256 id_) {
		require(!characters[_tokenId].isTombstone, "this is a tombstone");
		id_ = mintPersonage(msg.sender, false, false,_tokenURI, characters[_tokenId].name, characters[_tokenId].characteristics, characters[_tokenId].proofOfChoices);
		_burn(_tokenId);
	}
	/**
	 * @dev add choices for a character
	 * @param _tokenId token id
	 * @param _proofOfChoices merkle root for the proof of choice
	 */
	function setProofOfChoices(uint256 _tokenId,bytes32 _proofOfChoices) external isOwner(_tokenId) isReferential(_tokenId){
		characters[_tokenId].proofOfChoices = _proofOfChoices;
	}
	/**
	 * @dev add choices for a character
	 * @param _tokenId token id
	 * @param _characteristics merkle root for the characteristics
	 */
	function setCharacteristics(uint256 _tokenId,bytes32 _characteristics) external isOwner(_tokenId) isReferential(_tokenId){
		characters[_tokenId].characteristics = _characteristics;
	}	
	/**
	 * @dev burning a token when transferred
	 * @param _tokenId token id
	 */
	function burnForTranfer(uint256 _tokenId) external{
		require(_isApprovedOrOwner(msg.sender, _tokenId), "managing not approved");
		_burn(_tokenId);
	}
	/**
	 * @dev Getter for a character
	 * @param _tokenId id of a character
	 * @return personage_ a character
	 */
	function getPersonage(uint256 _tokenId) external view returns(Personage memory personage_){
		return characters[_tokenId];
	}
	/**
	 * @dev Getter for characters
	 * @return personages_ all characters
	 */
	function getAllPersonages() external view returns(Personage[] memory personages_){
		return characters;
	}
	/**
	 * @dev check that a choice has been made
	 * @param _tokenId id of a character
	 * @param _choice that a choice has been made
	 * @param _proof Merkle proof containing sibling hashes on the branch from the leaf to the root of the Merkle tree
	 */
	function madeIsChoice(uint256 _tokenId, string memory _choice, bytes32[] calldata _proof) external view returns(bool) {
		return _verify(leaf(_choice),characters[_tokenId].proofOfChoices ,_proof);
	}
	/**
	 * @dev check that a characteristic is present
	 * @param _tokenId id of a character
	 * @param _characteristic that a choice has been made
	 * @param _proof Merkle proof containing sibling hashes on the branch from the leaf to the root of the Merkle tree
	 */
	function hasThisCharacteristic(uint256 _tokenId, string memory _characteristic, bytes32[] calldata _proof) external view returns(bool) {
		return _verify(leaf(_characteristic),characters[_tokenId].characteristics ,_proof);
	}
	/**
	 * @dev mint a character 
	 * @param _player address to mint a character
	 * @param _isReferential determines if the token is a referential
	 * @param _isTombstone determines if the token is a tombstone
	 * @param _tokenURI Uniform Resource Identifier
	 * @param _name name of the character
	 * @param _characteristics merkle root for the characteristics of the character
	 * @param _proofOfChoices merkle root for the choice for the character
	 * @return newItemId_ id of the new token
	 */
	function mintPersonage(address _player, bool _isReferential, bool _isTombstone ,string memory _tokenURI, string memory _name ,bytes32 _characteristics, bytes32 _proofOfChoices) internal returns (uint256 newItemId_){
		newItemId_ = tokenIds.current();
		tokenIds.increment();
		characters.push(Personage(_isReferential, _isTombstone, _name, _characteristics, _proofOfChoices));
		_safeMint(_player, newItemId_);
		_setTokenURI(newItemId_, _tokenURI);
		
		return newItemId_;
	}
	/**
	 * @dev generate a leaf to check.
	 * @param _word item to verify.
	 */
	function leaf(string memory _word) internal pure returns(bytes32) {
		return keccak256(abi.encodePacked(_word));
	}
  	/**
	 * @dev Verifies a Merkle proof proving the existence of a leaf in a Merkle tree.
	 * @param _leaf Leaf of Merkle tree
	 * @param _merkleRoot Merkle root
	 * @param _proof Merkle proof containing sibling hashes on the branch from the leaf to the root of the Merkle tree
	 */
	function _verify(bytes32 _leaf,bytes32 _merkleRoot,bytes32[] memory _proof) internal pure returns(bool) {
		return MerkleProof.verify(_proof, _merkleRoot, _leaf);
	}
}