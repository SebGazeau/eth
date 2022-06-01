// const Characters = artifacts.require('Characters');
// // @ts-ignore
// import { BN, expectRevert, expectEvent } from '@openzeppelin/test-helpers';
// import characteristicsJSON from './utils/merkle/characteristics.json';
// import choicesJSON from './utils/merkle/choices.json';
// import { expect } from 'chai';
// import { MerkleTree } from 'merkletreejs';
// import keccak256 from 'keccak256';
// import { CharactersInstance } from '../types/truffle-contracts';
// import { AllEvents } from '../types/truffle-contracts/Characters';
// import { Account } from './utils/type/Account';
// contract('Characters', (accounts: Truffle.Accounts) => {
// 	type ttp = Truffle.TransactionResponse<AllEvents> | undefined;
// 	const account: Account = {
// 		zero: '0x0000000000000000000000000000000000000000',
// 		owner: accounts[0],
// 		first: accounts[1],
// 		second: accounts[2],
// 		third: accounts[3],
// 		four: accounts[4],
// 		five: accounts[5]
// 	}
// 	const characteristics = characteristicsJSON;
// 	const choices = choicesJSON;
// 	const tokenURI = 'token uri';
// 	const tokenURIstone = 'token uri tombstone';
// 	const tokenURIend = 'token uri end';
// 	const namePersonage = 'Morwan'
// 	let CharactersInstance: CharactersInstance;
// 	let personage:ttp, proposal: ttp, vote: ttp, tally: ttp, status: ttp;
// 	describe.skip('Characters', () => {
// 		before(async () => {
// 			CharactersInstance = await Characters.new({from: account.owner});
// 			CharactersInstance.initialize('Prototype','PTT');
// 		});
// 		context('Starts', ()=> {
// 			const tabCharacteristics: any[] = [];
// 			const tabChoices: any[] = [];
// 			characteristics.map((characteristic) => {tabCharacteristics.push(Object.values(characteristic)[0])});
// 			choices.map(choice => {tabChoices.push(Object.values(choice)[0])});
// 			const leaveCharacteristic = tabCharacteristics.map(characteristic => characteristic)
// 			const leaveChoice = tabChoices.map(choice => choice)
// 			const treeCharacteristic = new MerkleTree(leaveCharacteristic, keccak256, { hashLeaves: true, sortPairs: true });
// 			const rootCharacteristic = treeCharacteristic.getHexRoot();
// 			const leafCharacteristic = keccak256(leaveCharacteristic[0]);
// 			const proofCharacteristic = treeCharacteristic.getHexProof(leafCharacteristic);
// 			const treeChoice = new MerkleTree(leaveChoice, keccak256, { hashLeaves: true, sortPairs: true });
// 			const rootChoice = treeChoice.getHexRoot();
// 			const leafChoice = keccak256(leaveChoice[0]);
// 			const proofChoice = treeChoice.getHexProof(leafChoice);
// 			it('Mint Personage',async () => {
// 				personage = await CharactersInstance.firstPersonage(tokenURI, namePersonage, rootCharacteristic, rootChoice, {from: account.first});
// 				expect(personage).to.be.ok;
// 			});
// 			it('get Event Mint', () => {
// 				expectEvent(personage, 'Transfer',{from: account.zero, to: account.first, tokenId: new BN(0)})
// 			});
// 			it('should verify choice', async () => {
// 				console.log('leafChoice',leafChoice)
// 				console.log('proofChoice',proofChoice)
// 				expect(await CharactersInstance.madeIsChoice( new BN(0),'left',proofChoice)).to.equal(true);
// 			});
// 			it('should verify Characteristic', async () => {
// 				expect(await CharactersInstance.hasThisCharacteristic(new BN(0),'red',proofCharacteristic)).to.equal(true);
// 			});
// 			it('must not create a new first character', async () =>{
// 				await expectRevert(CharactersInstance.firstPersonage(tokenURI, namePersonage, rootCharacteristic, rootChoice, {from: account.first}), "Use other function");
// 			});
// 			it('must not create another character', async () =>{
// 				await expectRevert(CharactersInstance.newAfterDeath(tokenURI, namePersonage, rootCharacteristic, rootChoice, {from: account.first}), "A character is not dead");
// 			});
// 			it('must kill a character', async () =>{
// 				personage = await CharactersInstance.deadPersonage(new BN(0),tokenURIstone, {from: account.first});
// 				expect(personage).to.be.ok;
// 				const all =await CharactersInstance.getAllPersonages();
// 				console.log('all',all)
// 			});
// 			context('should not be able to modify a dead character', ()=>{
// 				const newChoices = [...choices,{choicesThree: 'middle'}];
// 				newChoices.map(choice => {tabChoices.push(Object.values(choice)[0])});
// 				const leaveChoice = tabChoices.map(choice => choice)
// 				const treeChoice = new MerkleTree(leaveChoice, keccak256, { hashLeaves: true, sortPairs: true });
// 				const rootChoice = treeChoice.getHexRoot();
// 				it('do not add new evidence to a grave', async () =>{
// 					await expectRevert(CharactersInstance.setProofOfChoices(new BN(0),rootChoice, {from: account.first}), "character can't be used");
// 				});
// 			})
// 			it('should create a new character when all others are dead', async () =>{
// 				personage = await CharactersInstance.newAfterDeath(tokenURI, namePersonage, rootCharacteristic, rootChoice, {from: account.first});
// 				expect(personage).to.be.ok;
// 			});
// 			it('get Event Mint for new character', () => {
// 				expectEvent(personage, 'Transfer',{from: account.zero, to: account.first, tokenId: new BN(1)})
// 			});
// 			context('in progress', () => {
// 				const tabChoices: any[] = [];
// 				const newChoices = [...choices,{choicesThree: 'middle'}];
// 				newChoices.map(choice => {tabChoices.push(Object.values(choice)[0])});
// 				const leaveChoice = tabChoices.map(choice => choice)
// 				const treeChoice = new MerkleTree(leaveChoice, keccak256, { hashLeaves: true, sortPairs: true });
// 				const rootChoice = treeChoice.getHexRoot();
// 				const leafChoice = keccak256('middle');
// 				const proofChoice = treeChoice.getHexProof(leafChoice);
// 				it('Add new merkle tree',async () => {
// 					personage = await CharactersInstance.setProofOfChoices(new BN(1),rootChoice, {from: account.first});
// 					expect(personage).to.be.ok;
// 				});
// 				it('should verify choice', async () => {
// 					expect(await CharactersInstance.madeIsChoice(new BN(1),'middle',proofChoice)).to.equal(true);
// 				});
// 			});
// 			context('for the end', () => {
// 				it('should create the final character', async () => {
// 					personage = await CharactersInstance.endOfStoryPersonage(new BN(1),tokenURIend, {from: account.first});
// 					expect(personage).to.be.ok;
// 				});
// 			})
// 		});
// 	});
// })