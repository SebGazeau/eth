// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;
import "./Characters.sol";
contract CharactersFactory {
    event CharactersCreated(string _collectionName, address _collectionAddress, address _creator);

    function createCharacters(string memory _collectionName, string memory _collectionSymbol) external payable returns (address collectionAddress){
        bytes32 _salt = keccak256(abi.encodePacked(_collectionName));
        collectionAddress = address(new Characters{salt: _salt}(_collectionName, _collectionSymbol));
        emit CharactersCreated(_collectionName, collectionAddress, msg.sender);
    }
}