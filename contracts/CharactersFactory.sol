// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "./Characters.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
/**
 * @title CharactersFactory
 * @author Sebastien Gazeau
 * @dev Create and manage collections for each story
 */
contract CharactersFactory is ERC721Holder {
	mapping(address => address[]) private listCharactersByPlayer;
	address immutable charactersImplementation;

    constructor() {
        charactersImplementation = address(new Characters());
    }
	/**
	 * @dev Emitted when a collection is created
	 */
	event CharactersCreated(string _collectionName, address _collectionAddress, address _creator);

	/**
	 * @dev Create a new character's collection
	 * @param _collectionName Name of the collection (story/volume)
	 * @param _collectionName Symbol of the collection (story/volume)
	 * @return clone_ Address of the collection
	 */
	function createCharacters(string memory _collectionName, string memory _collectionSymbol) external payable returns (address clone_){
		bytes32 salt = keccak256(abi.encodePacked(_collectionName));
		if (listCharactersByPlayer[msg.sender].length > 0){
			address predictDeterministicAddress = Clones.predictDeterministicAddress(charactersImplementation, salt);
			for (uint i = 0; i < listCharactersByPlayer[msg.sender].length; i++){
				require(listCharactersByPlayer[msg.sender][i] != predictDeterministicAddress, "A collection already exists");
			}
		}
		clone_ = Clones.cloneDeterministic(charactersImplementation, salt);
		Characters(clone_).initialize(_collectionName, _collectionSymbol);
		listCharactersByPlayer[msg.sender].push(clone_);
		emit CharactersCreated(_collectionName, clone_, msg.sender);
	}

	/**
	 * @dev Transfer a character from one collection to another
	 * @param _fromCollection the character's original collection
	 * @param _toCollection the collection to which the character is transferred
	 * @param _tokenId the id of the transferred token
	 * @return newTokenId_ the id of the character in the target collection
	 */
	function transferCharacter(address _fromCollection, address _toCollection, uint _tokenId) external returns (uint newTokenId_){
		for (uint i = 0; i < listCharactersByPlayer[msg.sender].length; i++){
			require(listCharactersByPlayer[msg.sender][i] == _fromCollection || listCharactersByPlayer[msg.sender][i] == _toCollection, "Transfer is not possible");
		}

		Characters.Personage memory characterFrom = Characters(_fromCollection).getPersonage(_tokenId);
		Characters.Personage[] memory charactersTo = Characters(_toCollection).getAllPersonages();
		require(!characterFrom.isReferential && !characterFrom.isTombstone, "character can't be transferred");
		
		if(charactersTo.length > 0){
			newTokenId_ = Characters(_toCollection).newAfterDeath(Characters(_fromCollection).tokenURI(_tokenId), characterFrom.name, characterFrom.characteristics, characterFrom.proofOfChoices);
		}else{
			newTokenId_ = Characters(_toCollection).firstPersonage(Characters(_fromCollection).tokenURI(_tokenId), characterFrom.name, characterFrom.characteristics, characterFrom.proofOfChoices);
		}

		Characters(_toCollection).safeTransferFrom(address(this), msg.sender, newTokenId_);
		Characters(_fromCollection).burnForTranfer(_tokenId);
	}
}