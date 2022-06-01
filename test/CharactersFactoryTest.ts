const CharactersFactory = artifacts.require('CharactersFactory');
const Characters = artifacts.require('Characters');
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

// @ts-ignore
import { BN, expectRevert, expectEvent } from '@openzeppelin/test-helpers';
import characteristicsJSON from './utils/merkle/characteristics.json';
import choicesJSON from './utils/merkle/choices.json';
import { expect } from 'chai';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { CharactersInstance } from '../types/truffle-contracts';
import { CharactersFactoryInstance } from '../types/truffle-contracts';
import { AllEvents } from '../types/truffle-contracts/Characters';
import { CharactersCreated } from '../types/truffle-contracts/CharactersFactory';
import { Account } from './utils/type/Account';
contract('Characters', (accounts: Truffle.Accounts) => {
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
	const collectionNameFirst = 'Prototype First';
	const collectionTagFirst = 'PTF';
    const collectionNameSecond = 'Prototype Second';
	const collectionTagSecond = 'PTS';
	const namePersonage = 'Morwan'
	const namePersonageDead = 'Morwan dead'
	const namePersonageTwo = 'Morwan two'
	let charactersInstanceFirst: CharactersInstance;
	let charactersInstanceSecond: CharactersInstance;
	let charactersFactoryInstance: CharactersFactoryInstance;
	let collection: Truffle.TransactionResponse<CharactersCreated>; 
    let transfer;
    let addressFirst: string;
    let addressSecond: string;
    let personage: ttp, tally: ttp, status: ttp;
	describe('Characters', () => {
		before(async () => {
            charactersFactoryInstance = await CharactersFactory.new({from: account.owner});
            console.log(charactersFactoryInstance.address)
            // console.log(collection.logs[0].args)

        });
		// context('Starts', ()=> {
			it('should create a first character collection', async () =>{
				collection = await charactersFactoryInstance.createCharacters(collectionNameFirst, collectionTagFirst, {from: account.first});
                addressFirst = collection.logs[0].args._collectionAddress;
				expect(collection).to.be.ok;
			});
			context('in progress', () => {
                before(async () => {charactersInstanceFirst = await Characters.at(addressFirst)});
                const tabCharacteristics: any[] = [];
                const tabChoices: any[] = [];
                characteristics.map((characteristic) => {tabCharacteristics.push(Object.values(characteristic)[0])});
                choices.map(choice => {tabChoices.push(Object.values(choice)[0])});
                const leaveCharacteristic = tabCharacteristics.map(characteristic => characteristic)
                const leaveChoice = tabChoices.map(choice => choice)
                const treeCharacteristic = new MerkleTree(leaveCharacteristic, keccak256, { hashLeaves: true, sortPairs: true });
                const rootCharacteristic = treeCharacteristic.getHexRoot();
                const leafCharacteristic = keccak256(leaveCharacteristic[0]);
                const proofCharacteristic = treeCharacteristic.getHexProof(leafCharacteristic);
                const treeChoice = new MerkleTree(leaveChoice, keccak256, { hashLeaves: true, sortPairs: true });
                const rootChoice = treeChoice.getHexRoot();
                const leafChoice = keccak256(leaveChoice[0]);
                const proofChoice = treeChoice.getHexProof(leafChoice);
                it('Mint Personage',async () => {
                    personage = await charactersInstanceFirst.firstPersonage(tokenURI, namePersonage, rootCharacteristic, rootChoice, {from: account.first});
                    expect(personage).to.be.ok;
                });
                it('get Event Mint', () => {
                    expectEvent(personage, 'Transfer',{from: account.zero, to: account.first, tokenId: new BN(0)})
                });
                it('should verify choice', async () => {
                    expect(await charactersInstanceFirst.madeIsChoice( new BN(0),'left',proofChoice)).to.equal(true);
                });
                it('should verify Characteristic', async () => {
                    expect(await charactersInstanceFirst.hasThisCharacteristic(new BN(0),'red',proofCharacteristic)).to.equal(true);
                });
                it('must not create a new first character', async () =>{
                    await expectRevert(charactersInstanceFirst.firstPersonage(tokenURI, namePersonage, rootCharacteristic, rootChoice, {from: account.first}), "Use other function");
                });
                it('must not create another character', async () =>{
                    await expectRevert(charactersInstanceFirst.newAfterDeath(tokenURI, namePersonageTwo, rootCharacteristic, rootChoice, {from: account.first}), "A character is not dead");
                });
                it('must kill a character', async () =>{
                    personage = await charactersInstanceFirst.deadPersonage(new BN(0),tokenURIstone, {from: account.first});
                    expect(personage).to.be.ok;
                });
                context('should not be able to modify a dead character', ()=>{
                    const newChoices = [...choices,{choicesThree: 'middle'}];
                    newChoices.map(choice => {tabChoices.push(Object.values(choice)[0])});
                    const leaveChoice = tabChoices.map(choice => choice)
                    const treeChoice = new MerkleTree(leaveChoice, keccak256, { hashLeaves: true, sortPairs: true });
                    const rootChoice = treeChoice.getHexRoot();
                    it('do not add new evidence to a grave', async () =>{
                        await expectRevert(charactersInstanceFirst.setProofOfChoices(new BN(0),rootChoice, {from: account.first}), "character can't be used");
                    });
                })
                it('should create a new character when all others are dead', async () =>{
                    personage = await charactersInstanceFirst.newAfterDeath(tokenURI, namePersonageTwo, rootCharacteristic, rootChoice, {from: account.first});
                    expect(personage).to.be.ok;
                });
                it('get Event Mint for new character', () => {
                    expectEvent(personage, 'Transfer',{from: account.zero, to: account.first, tokenId: new BN(1)})
                });
                context('in progress', () => {
                    const tabChoices: any[] = [];
                    const newChoices = [...choices,{choicesThree: 'middle'}];
                    newChoices.map(choice => {tabChoices.push(Object.values(choice)[0])});
                    const leaveChoice = tabChoices.map(choice => choice)
                    const treeChoice = new MerkleTree(leaveChoice, keccak256, { hashLeaves: true, sortPairs: true });
                    const rootChoice = treeChoice.getHexRoot();
                    const leafChoice = keccak256('middle');
                    const proofChoice = treeChoice.getHexProof(leafChoice);
                    it('Add new merkle tree',async () => {
                        personage = await charactersInstanceFirst.setProofOfChoices(new BN(1),rootChoice, {from: account.first});
                        expect(personage).to.be.ok;
                    });
                    it('should verify choice', async () => {
                        expect(await charactersInstanceFirst.madeIsChoice(new BN(1),'middle',proofChoice)).to.equal(true);
                    });
                });
                context('for the end', () => {
                    it('should create the final character', async () => {
                        personage = await charactersInstanceFirst.endOfStoryPersonage(new BN(1),tokenURIend, {from: account.first});
                        expect(personage).to.be.ok;
                    });
                })
                it('should create a second character collection', async () =>{
                    collection = await charactersFactoryInstance.createCharacters(collectionNameSecond, collectionTagSecond, {from: account.first});
                    addressSecond = collection.logs[0].args._collectionAddress;
                    expect(collection).to.be.ok;
                });
                context('for the future', () => {
                    before(async () => {charactersInstanceSecond = await Characters.at(addressSecond)});
                    it('should transfer the character',async () => {
                        await charactersInstanceFirst.approve(charactersFactoryInstance.address,new BN(1),{from: account.first});
                        transfer = await charactersFactoryInstance.transferCharacter(addressFirst, addressSecond, new BN(1),{from: account.first});
                        expect(personage).to.be.ok;
                    });
                    it('verify transfer', async ()=>{
                        await expectRevert(charactersInstanceFirst.ownerOf(new BN(1)), "ERC721: owner query for nonexistent token");
                        const transferred = await charactersInstanceSecond.ownerOf(new BN(0));
                        expect(transferred).to.equal(account.first);

                    })
                });
			});
		// 	context('for the end', () => {
		// 	})
		// });
	});
})