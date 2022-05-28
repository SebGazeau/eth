const Characters = artifacts.require('Characters');
// @ts-ignore
import { BN, expectRevert, expectEvent } from '@openzeppelin/test-helpers';
import characteristicsJSON from './utils/merkle/characteristics.json';
import choicesJSON from './utils/merkle/choices.json';
import { expect } from 'chai';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { CharactersInstance } from '../types/truffle-contracts';
import { AllEvents } from '../types/truffle-contracts/Characters';
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
	const namePersonage = 'Morwan'
	let CharactersInstance: CharactersInstance;
	let personage:ttp, proposal: ttp, vote: ttp, tally: ttp, status: ttp;
	describe('Characters', () => {
		before(async () => {CharactersInstance = await Characters.new('Prototype', 'PTT',{from: account.owner})});
		context('Starts', ()=> {
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
				personage = await CharactersInstance.MintPersonage(account.first, tokenURI, namePersonage, rootCharacteristic, rootChoice);
				expect(personage).to.be.ok;
			});
			it('get Event Mint', () => {
				expectEvent(personage, 'Transfer',{from: account.zero, to: account.first, tokenId: new BN(0)})
			});
			it('should verify choice', async () => {
				console.log('leafChoice',leafChoice)
				console.log('proofChoice',proofChoice)
				expect(await CharactersInstance.madeIsChoice('left',proofChoice, new BN(0))).to.equal(true);
			});
			it('should verify Characteristic', async () => {
				expect(await CharactersInstance.hasThisCharacteristic('red',proofCharacteristic, new BN(0))).to.equal(true);
			});
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
				personage = await CharactersInstance.setProofOfChoices(new BN(0),rootChoice);
				expect(personage).to.be.ok;
			});
			it('should verify choice', async () => {
				console.log('proofChoice',proofChoice)
				expect(await CharactersInstance.madeIsChoice('middle',proofChoice, new BN(0))).to.equal(true);
			});
		})
	});
})