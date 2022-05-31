// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "./Characters.sol";

/**
 * @title CharactersFactory
 * @author Sebastien Gazeau
 * @dev Create and manage collections for each story
 */
contract CharactersFactory {
	mapping(address => address[]) private listCharactersByPlayer;
	
	/**
	 * @dev Emitted when a collection is created
	 */
	event CharactersCreated(string _collectionName, address _collectionAddress, address _creator);

	/**
	 * @dev Create a new character's collection
	 * @param _collectionName Name of the collection (story/volume)
	 * @param _collectionName Symbol of the collection (story/volume)
	 * @return collectionAddress_ Address of the collection
	 */
	function createCharacters(string memory _collectionName, string memory _collectionSymbol) external payable returns (address collectionAddress_){
		if (listCharactersByPlayer[msg.sender].length > 0){
			for (uint i = 0; i < listCharactersByPlayer[msg.sender].length; i++){
				require(keccak256(abi.encodePacked(Characters(listCharactersByPlayer[msg.sender][i]).name())) != keccak256(abi.encodePacked(_collectionName)), "A collection already exists");
			}
		}
		bytes32 _salt = keccak256(abi.encodePacked(_collectionName));
		collectionAddress_ = address(new Characters{salt: _salt}(_collectionName, _collectionSymbol));
		listCharactersByPlayer[msg.sender].push(collectionAddress_);
		emit CharactersCreated(_collectionName, collectionAddress_, msg.sender);
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
			newTokenId_ = Characters(_fromCollection).newAfterDeath(Characters(_fromCollection).tokenURI(_tokenId), characterFrom.name, characterFrom.characteristics, characterFrom.proofOfChoices);
		}else{
			newTokenId_ = Characters(_toCollection).firstPersonage(Characters(_toCollection).tokenURI(_tokenId), characterFrom.name, characterFrom.characteristics, characterFrom.proofOfChoices);
		}

		Characters(_toCollection).safeTransferFrom(address(this), msg.sender, newTokenId_);
		Characters(_fromCollection).burnForTranfer(_tokenId);
	}
}