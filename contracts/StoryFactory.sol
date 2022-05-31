// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./CharactersFactory.sol";

/**
 * @title CharactersFactory
 * @author Sebastien Gazeau
 * @dev Create and manage collections for each story
 */
contract StoryFactory {
    struct Story {
        string name;
        string author;
    }
    address immutable factoryImplementation;
    mapping(string => mapping(address => Story)) stories;

    constructor() {
        factoryImplementation = address(new CharactersFactory());
    }
    /**
	 * @dev Create a new characters factory
	 * @param _nameStory Name of the story
	 * @param _nameVolume Name of the volume of the story
	 * @param _author Author of the story
	 * @return clone_ Address of the characters factory
	 */
    function createFactory(string calldata _nameStory, string calldata _nameVolume, string calldata _author) external returns (address clone_) {
        require(bytes(_nameStory).length > 0 && bytes(_nameVolume).length > 0, "Story or volume name is empty");
        bytes32 salt = keccak256(abi.encodePacked(string.concat(_nameStory,_nameVolume)));
        address predictDeterministicAddress = Clones.predictDeterministicAddress(factoryImplementation, salt);
        require(
            keccak256(abi.encodePacked(stories[_nameStory][predictDeterministicAddress].name)) != keccak256(abi.encodePacked(_nameVolume)) && 
            keccak256(abi.encodePacked(stories[_nameStory][predictDeterministicAddress].author)) != keccak256(abi.encodePacked(_author)), 
            "This story already exits");

        clone_ = Clones.cloneDeterministic(factoryImplementation, salt);
        stories[_nameStory][clone_].name = _nameVolume;
        stories[_nameStory][clone_].author = _author;

        return clone_;
    }
}