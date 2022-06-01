const StoryFactory = artifacts.require('StoryFactory');
const Characters = artifacts.require('Characters');
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

// @ts-ignore
import { BN, expectRevert, expectEvent } from '@openzeppelin/test-helpers';
import characteristicsJSON from './utils/merkle/characteristics.json';
import choicesJSON from './utils/merkle/choices.json';
import { expect } from 'chai';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { StoryFactoryInstance } from '../types/truffle-contracts';
import { AllEvents } from '../types/truffle-contracts/Characters';
import { CharactersCreated } from '../types/truffle-contracts/CharactersFactory';
import { Account } from './utils/type/Account';
contract('StoryFactory', (accounts: Truffle.Accounts) => {
	type ttp = Truffle.TransactionResponse<AllEvents> | undefined;
	const account: Account = {
		zero: '0x0000000000000000000000000000000000000000',
		owner: accounts[0],
		first: accounts[1],
		second: accounts[2],
		third: accounts[3],
		four: accounts[4],
		five: accounts[5]
	}
	const characteristics = characteristicsJSON;
	const choices = choicesJSON;
	const tokenURI = 'token uri';
    const tokenURIstone = 'token uri tombstone';
	const tokenURIend = 'token uri end';
	const nameStoryFirst = 'First Story';
	const nameVolumeFirst = 'First Volume';
    const authorFirst = 'Sebastien';
	const collectionTagSecond = 'PTS';
	const namePersonage = 'Morwan'
	const namePersonageDead = 'Morwan dead'
	const namePersonageTwo = 'Morwan two'
	let storyFactoryInstance: StoryFactoryInstance;
    let transfer;
    let addressFirst: string;
    let addressSecond: string;
    let factory: ttp, tally: ttp, status: ttp;
	describe('Create CharactersFactory', () => {
		before(async () => {
            storyFactoryInstance = await StoryFactory.new({from: account.owner});
            // console.log(charactersFactoryInstance.address)
            // console.log(collection.logs[0].args)

        });
		// context('Starts', ()=> {
			it('should create a character factory', async () =>{
				factory = await storyFactoryInstance.createFactory(nameStoryFirst, nameVolumeFirst, authorFirst, {from: account.first});
                // addressFirst = collection.logs[0].args._collectionAddress;
				expect(factory).to.be.ok;
			});
			it('should not create a character factory with same data (names)', async () =>{
				await expectRevert(storyFactoryInstance.createFactory(nameStoryFirst, nameVolumeFirst, authorFirst, {from: account.first}), "This story already exits");
			});
			// });
		// 	context('for the end', () => {
		// 	})
		// });
	});
})