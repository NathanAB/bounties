// Set up a Truffle contract, representing our deployed Box instance
const Gold = artifacts.require('AdventureGold');
const Loot = artifacts.require('Loot');
const Bounty = artifacts.require('Bounty');
const Glory = artifacts.require('GloryForAdventurers');

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const BigNumber = require("bignumber.js");

const decimals = new BigNumber(1000000000000000000);

contract("Bounty", accounts => {
  let bounty;
  let gold;
  let loot;
  let glory;

  beforeEach(async () => {
    bounty = await Bounty.deployed();
    gold = await Gold.deployed();
    loot = await Loot.deployed();
    glory = await Glory.deployed();
  });

  describe('getReward()', () => {
    it('bounty 0', async () => {
      expect((await bounty.getReward(0)).toString()).to.equal('1000')
    });
    it('bounty 1', async () => {
      expect((await bounty.getReward(1)).toString()).to.equal('3000')
    });
    it('bounty 2', async () => {
      expect((await bounty.getReward(2)).toString()).to.equal('10000')
    });
    it('bounty 3', async () => {
      expect((await bounty.getReward(3)).toString()).to.equal('1000')
    });
  });

  describe('getBountyRequirements() and getBountyRequirementsText()', () => {
    it('bounty 0', async () => {
      const reqs = await bounty.getBountyRequirements(0);

      const reqNumbers = reqs.map(req => req.toString());

      const reqString = await bounty.getBountyRequirementsText(0);

      const expectedNumbers = ['15,0,0,0,0,1', '0,0,0,0,0,5', '1,0,0,0,0,8', '0,0,0,0,0,0']
      const expectedText = ["Chronicle", "Holy Greaves", "Silver Ring", ""];

      expect(reqString.slice(0, 4)).to.deep.equal(expectedText);
      expect(reqNumbers.slice(0, 4)).to.deep.equal(expectedNumbers);
    });

    it('bounty 1', async () => {
      const reqs = await bounty.getBountyRequirements(1);

      const reqNumbers = reqs.map(req => req.toString());

      const reqString = await bounty.getBountyRequirementsText(1);

      const expectedNumbers = [
        '1,0,0,0,0,7', '11,4,33,12,1,1',
        '2,0,0,0,0,4', '5,0,0,0,0,1',
        '9,5,0,0,0,6', '2,15,0,0,0,1',
        '4,3,0,0,0,6', '11,0,0,0,0,2',
        '4,0,0,0,0,8', '7,10,56,8,0,2',
        '12,0,0,0,0,6', '0,0,0,0,0,0'
      ]
      const expectedText = ["Amulet", "Grave Wand", "Plated Belt", "Katana"];

      expect(reqNumbers.slice(0, 12)).to.deep.equal(expectedNumbers);
      expect(reqString.slice(0, 4)).to.deep.equal(expectedText);
    });
  });

  describe('getBountyMonster()', () => {
    it('bounty 0', async () => {
      const monster = await bounty.getBountyMonster(0);
      expect(monster).to.equal('POSSESSED WIGHT');
    });

    it('bounty 1', async () => {
      const monster = await bounty.getBountyMonster(1);
      expect(monster).to.equal('VICIOUS WEREWOLF');
    });

    it('bounty 2', async () => {
      const monster = await bounty.getBountyMonster(2);
      expect(monster).to.equal('POSSESSED KRAKEN');
    });
  });

  describe('tokenURI()', () => {
    it('bounty 6', async () => {
      const tokenUri = await bounty.tokenURI(6);
      expect(tokenUri).to.equal('eyJuYW1lIjogIkJvdW50eSAjNiIsICJkZXNjcmlwdGlvbiI6ICJCb3VudGllcyBjYW4gYmUgcmVkZWVtZWQgZm9yIGdsb3J5IHdoZW4gbXVsdGlwbGUgYWR2ZW50dXJlcnMgY29vcmRpbmF0ZSB0byBjb21wbGV0ZSB0aGUgcmVxdWlyZW1lbnRzLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSEJ5WlhObGNuWmxRWE53WldOMFVtRjBhVzg5SW5oTmFXNVpUV2x1SUcxbFpYUWlJSFpwWlhkQ2IzZzlJakFnTUNBek5UQWdNelV3SWo0OGMzUjViR1UrTG1KaGMyVWdleUJtYVd4c09pQjNhR2wwWlRzZ1ptOXVkQzFtWVcxcGJIazZJSE5sY21sbU95Qm1iMjUwTFhOcGVtVTZJREV5Y0hnN0lIMDhMM04wZVd4bFBqeHlaV04wSUhkcFpIUm9QU0l4TURBbElpQm9aV2xuYUhROUlqRXdNQ1VpSUdacGJHdzlJbUpzWVdOcklpQXZQangwWlhoMElIZzlJakV3SWlCNVBTSXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRWdTRVZTVDBsRElHSnZkVzUwZVNCb1lYTWdZbVZsYmlCd2IzTjBaV1FnZEc4Z2MyeGhlU0IwYUdVOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJak0xSWlCamJHRnpjejBpWW1GelpTSStSazlTVTBGTFJVNGdVa0ZRVkU5U0lIUmxjbkp2Y21sNmFXNW5JRzkxY2lCc1lXNWtjeUU4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqY3dJaUJqYkdGemN6MGlZbUZ6WlNJK1ZHOGdZMjl0Y0d4bGRHVWdkR2hsSUdKdmRXNTBlU3dnWjJGMGFHVnlJSGx2ZFhJZ1ptVnNiRzkzSUdGa2RtVnVkSFZ5WlhKelBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0k0TlNJZ1kyeGhjM005SW1KaGMyVWlQbmRvYnlCb2IyeGtJSFJvWlNCeVpYRjFhWEpsWkNCcGRHVnRjem84TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqRXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRnRkV3hsZER3dmRHVjRkRDQ4ZEdWNGRDQjRQU0l4TUNJZ2VUMGlNVE0xSWlCamJHRnpjejBpWW1GelpTSStUbVZqYTJ4aFkyVThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpFMU1DSWdZMnhoYzNNOUltSmhjMlVpUGtOb1lXbHVJRTFoYVd3OEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJakUyTlNJZ1kyeGhjM005SW1KaGMyVWlQbEJsYm1SaGJuUThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpFNE1DSWdZMnhoYzNNOUltSmhjMlVpUGxScGRHRnVhWFZ0SUZKcGJtYzhMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpNek1DSWdZMnhoYzNNOUltSmhjMlVpUGtFZ2NtVjNZWEprSUc5bUlPS2NxUENkbjVrczhKMmZtUENkbjVqd25aK1lJUENkbEw3d25aV0Q4SjJWaHVLRW5mQ2RsWkRpbktnZ2MyaGhiR3dnWW1VZ2MzQnNhWFFnWVcxdmJtY2dkR2hsSUhCaGNuUjVMand2ZEdWNGRENDhMM04yWno0PSJ9');
    });

    it('bounty 7', async () => {
      const tokenUri = await bounty.tokenURI(7);
      expect(tokenUri).to.equal('eyJuYW1lIjogIkJvdW50eSAjNyIsICJkZXNjcmlwdGlvbiI6ICJCb3VudGllcyBjYW4gYmUgcmVkZWVtZWQgZm9yIGdsb3J5IHdoZW4gbXVsdGlwbGUgYWR2ZW50dXJlcnMgY29vcmRpbmF0ZSB0byBjb21wbGV0ZSB0aGUgcmVxdWlyZW1lbnRzLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSEJ5WlhObGNuWmxRWE53WldOMFVtRjBhVzg5SW5oTmFXNVpUV2x1SUcxbFpYUWlJSFpwWlhkQ2IzZzlJakFnTUNBek5UQWdNelV3SWo0OGMzUjViR1UrTG1KaGMyVWdleUJtYVd4c09pQjNhR2wwWlRzZ1ptOXVkQzFtWVcxcGJIazZJSE5sY21sbU95Qm1iMjUwTFhOcGVtVTZJREV5Y0hnN0lIMDhMM04wZVd4bFBqeHlaV04wSUhkcFpIUm9QU0l4TURBbElpQm9aV2xuYUhROUlqRXdNQ1VpSUdacGJHdzlJbUpzWVdOcklpQXZQangwWlhoMElIZzlJakV3SWlCNVBTSXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRnVJT0tkbCsrNGowVlFTVVBpblpmdnVJOGdZbTkxYm5SNUlHaGhjeUJpWldWdUlIQnZjM1JsWkNCMGJ5QnpiR0Y1SUhSb1pUd3ZkR1Y0ZEQ0OGRHVjRkQ0I0UFNJeE1DSWdlVDBpTXpVaUlHTnNZWE56UFNKaVlYTmxJajVEVDFKU1ZWQlVSVVFnVjBWU1JWZFBURVlnZEdWeWNtOXlhWHBwYm1jZ2IzVnlJR3hoYm1SeklUd3ZkR1Y0ZEQ0OGRHVjRkQ0I0UFNJeE1DSWdlVDBpTnpBaUlHTnNZWE56UFNKaVlYTmxJajVVYnlCamIyMXdiR1YwWlNCMGFHVWdZbTkxYm5SNUxDQm5ZWFJvWlhJZ2VXOTFjaUJtWld4c2IzY2dZV1IyWlc1MGRYSmxjbk04TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqZzFJaUJqYkdGemN6MGlZbUZ6WlNJK2QyaHZJR2h2YkdRZ2RHaGxJSEpsY1hWcGNtVmtJR2wwWlcxek9qd3ZkR1Y0ZEQ0OGRHVjRkQ0I0UFNJeE1DSWdlVDBpTVRJd0lpQmpiR0Z6Y3owaVltRnpaU0krUVcxMWJHVjBQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRXdJaUI1UFNJeE16VWlJR05zWVhOelBTSmlZWE5sSWo1SGNtVmhkbVZ6UEM5MFpYaDBQangwWlhoMElIZzlJakV3SWlCNVBTSXhOVEFpSUdOc1lYTnpQU0ppWVhObElqNVBjbTVoZEdVZ1FtVnNkRHd2ZEdWNGRENDhkR1Y0ZENCNFBTSXhNQ0lnZVQwaU1UWTFJaUJqYkdGemN6MGlZbUZ6WlNJK1RHVmhkR2hsY2lCRFlYQThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpFNE1DSWdZMnhoYzNNOUltSmhjMlVpUGtSeVlXZHZibk5yYVc0Z1FYSnRiM0k4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqRTVOU0lnWTJ4aGMzTTlJbUpoYzJVaVBsTjBkV1JrWldRZ1RHVmhkR2hsY2lCQ1pXeDBQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRXdJaUI1UFNJeU1UQWlJR05zWVhOelBTSmlZWE5sSWo1RWNtRm5iMjV6YTJsdUlFSmxiSFE4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqSXlOU0lnWTJ4aGMzTTlJbUpoYzJVaVBrTnliM2R1UEM5MFpYaDBQangwWlhoMElIZzlJakV3SWlCNVBTSXlOREFpSUdOc1lYTnpQU0ppWVhObElqNVFiR0YwYVc1MWJTQlNhVzVuUEM5MFpYaDBQangwWlhoMElIZzlJakV3SWlCNVBTSXpNekFpSUdOc1lYTnpQU0ppWVhObElqNUJJSEpsZDJGeVpDQnZaaURpbktqd25aK2JMUENkbjVqd25aK1k4SjJmbUNEd25aUys4SjJWZy9DZGxZYmloSjN3blpXUTRweW9JSE5vWVd4c0lHSmxJSE53YkdsMElHRnRiMjVuSUhSb1pTQndZWEowZVM0OEwzUmxlSFErUEM5emRtYysifQ==');
    });

    it('bounty 8', async () => {
      const tokenUri = await bounty.tokenURI(8);
      expect(tokenUri).to.equal('eyJuYW1lIjogIkJvdW50eSAjOCIsICJkZXNjcmlwdGlvbiI6ICJCb3VudGllcyBjYW4gYmUgcmVkZWVtZWQgZm9yIGdsb3J5IHdoZW4gbXVsdGlwbGUgYWR2ZW50dXJlcnMgY29vcmRpbmF0ZSB0byBjb21wbGV0ZSB0aGUgcmVxdWlyZW1lbnRzLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSEJ5WlhObGNuWmxRWE53WldOMFVtRjBhVzg5SW5oTmFXNVpUV2x1SUcxbFpYUWlJSFpwWlhkQ2IzZzlJakFnTUNBek5UQWdNelV3SWo0OGMzUjViR1UrTG1KaGMyVWdleUJtYVd4c09pQjNhR2wwWlRzZ1ptOXVkQzFtWVcxcGJIazZJSE5sY21sbU95Qm1iMjUwTFhOcGVtVTZJREV5Y0hnN0lIMDhMM04wZVd4bFBqeHlaV04wSUhkcFpIUm9QU0l4TURBbElpQm9aV2xuYUhROUlqRXdNQ1VpSUdacGJHdzlJbUpzWVdOcklpQXZQangwWlhoMElIZzlJakV3SWlCNVBTSXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRWc0b0M4NzdpUFRFVkhSVTVFUVZKWjRvQzg3N2lQSUdKdmRXNTBlU0JvWVhNZ1ltVmxiaUJ3YjNOMFpXUWdkRzhnYzJ4aGVTQjBhR1U4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqTTFJaUJqYkdGemN6MGlZbUZ6WlNJK1FVNURTVVZPVkNCUVNWUWdSa2xGVGtRZ2RHVnljbTl5YVhwcGJtY2diM1Z5SUd4aGJtUnpJVHd2ZEdWNGRENDhkR1Y0ZENCNFBTSXhNQ0lnZVQwaU56QWlJR05zWVhOelBTSmlZWE5sSWo1VWJ5QmpiMjF3YkdWMFpTQjBhR1VnWW05MWJuUjVMQ0JuWVhSb1pYSWdlVzkxY2lCbVpXeHNiM2NnWVdSMlpXNTBkWEpsY25NOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJamcxSWlCamJHRnpjejBpWW1GelpTSStkMmh2SUdodmJHUWdkR2hsSUhKbGNYVnBjbVZrSUdsMFpXMXpPand2ZEdWNGRENDhkR1Y0ZENCNFBTSXhNQ0lnZVQwaU1USXdJaUJqYkdGemN6MGlZbUZ6WlNJK1NHOXNlU0JIY21WaGRtVnpQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRXdJaUI1UFNJeE16VWlJR05zWVhOelBTSmlZWE5sSWo1SVlYSmtJRXhsWVhSb1pYSWdRbTl2ZEhNOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJakUxTUNJZ1kyeGhjM005SW1KaGMyVWlQbFJ2YldVOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJakUyTlNJZ1kyeGhjM005SW1KaGMyVWlQazl5Ym1GMFpTQkhjbVZoZG1WelBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0l4T0RBaUlHTnNZWE56UFNKaVlYTmxJajVRYkdGMGFXNTFiU0JTYVc1blBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0l4T1RVaUlHTnNZWE56UFNKaVlYTmxJajVVYVhSaGJtbDFiU0JTYVc1blBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0l5TVRBaUlHTnNZWE56UFNKaVlYTmxJajVFY21GbmIyNXphMmx1SUVKbGJIUThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpJeU5TSWdZMnhoYzNNOUltSmhjMlVpUGxkaGNpQkNaV3gwUEM5MFpYaDBQangwWlhoMElIZzlJakV3SWlCNVBTSXlOREFpSUdOc1lYTnpQU0ppWVhObElqNU5aWE5vSUVKbGJIUThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpJMU5TSWdZMnhoYzNNOUltSmhjMlVpUGxkdmIyd2dVMkZ6YUR3dmRHVjRkRDQ4ZEdWNGRDQjRQU0l4TUNJZ2VUMGlNamN3SWlCamJHRnpjejBpWW1GelpTSStVM1IxWkdSbFpDQk1aV0YwYUdWeUlFSmxiSFE4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVFkxSWlCNVBTSXhNakFpSUdOc1lYTnpQU0ppWVhObElqNUVaVzF2YmlCRGNtOTNiand2ZEdWNGRENDhkR1Y0ZENCNFBTSXhOalVpSUhrOUlqRXpOU0lnWTJ4aGMzTTlJbUpoYzJVaVBsQmxibVJoYm5ROEwzUmxlSFErUEhSbGVIUWdlRDBpTVRZMUlpQjVQU0l4TlRBaUlHTnNZWE56UFNKaVlYTmxJajVUYUdseWREd3ZkR1Y0ZEQ0OGRHVjRkQ0I0UFNJeE5qVWlJSGs5SWpFMk5TSWdZMnhoYzNNOUltSmhjMlVpUGxKcGJtY2dUV0ZwYkR3dmRHVjRkRDQ4ZEdWNGRDQjRQU0l4TmpVaUlIazlJakU0TUNJZ1kyeGhjM005SW1KaGMyVWlQbE5wYkdzZ1UyRnphRHd2ZEdWNGRENDhkR1Y0ZENCNFBTSXhOalVpSUhrOUlqRTVOU0lnWTJ4aGMzTTlJbUpoYzJVaVBrUnBkbWx1WlNCSWIyOWtQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRTJOU0lnZVQwaU1qRXdJaUJqYkdGemN6MGlZbUZ6WlNJK1UzUjFaR1JsWkNCTVpXRjBhR1Z5SUVGeWJXOXlQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRXdJaUI1UFNJek16QWlJR05zWVhOelBTSmlZWE5sSWo1QklISmxkMkZ5WkNCdlppRGluS2p3blorWjhKMmZtQ3p3blorWThKMmZtUENkbjVnZzhKMlV2dkNkbFlQd25aV0c0b1NkOEoyVmtPS2NxQ0J6YUdGc2JDQmlaU0J6Y0d4cGRDQmhiVzl1WnlCMGFHVWdjR0Z5ZEhrdVBDOTBaWGgwUGp3dmMzWm5QZz09In0=');
    });
  });

  describe('getItemsRemaining() and getComponentsRemaining()', () => {
    it('bounty 0', async () => {
      await gold.approve(bounty.address, decimals.times(200));
      
      await bounty.mintHeroicBounty();

      let itemsRem = await bounty.getItemsRemaining(0);
      let componentsRem = (await bounty.getComponentsRemaining(0)).map(req => req.toString());
      expect(itemsRem.slice(0, 3)).to.deep.equal(['Chronicle', 'Holy Greaves', 'Silver Ring']);
      expect(componentsRem.slice(0, 3)).to.deep.equal(['15,0,0,0,0,1', '0,0,0,0,0,5', '1,0,0,0,0,8']);

      // Claim loot bag with 'Chronicle'
      await loot.claim(7582);

      // Pledge 'Chronicle' to bounty
      await bounty.pledgeLootToBounty(7582, 0);

      // Should not have 'Chronicle' remaining anymore
      itemsRem = await bounty.getItemsRemaining(0);
      componentsRem = (await bounty.getComponentsRemaining(0)).map(req => req.toString());
      expect(itemsRem.slice(0, 3)).to.deep.equal(['', 'Holy Greaves', 'Silver Ring']);
      expect(componentsRem.slice(0, 3)).to.deep.equal(['0,0,0,0,0,0', '0,0,0,0,0,5', '1,0,0,0,0,8']);
    });

    it('bounty 1', async () => {
      await gold.approve(bounty.address, decimals.times(200));
      await bounty.mintEpicBounty();

      let itemsRem = await bounty.getItemsRemaining(1);
      expect(itemsRem.slice(0, 10)).to.deep.equal([
        'Amulet',         'Grave Wand',
        'Plated Belt',    'Katana',
        'Leather Gloves', 'Maul',
        'Heavy Gloves',   'Ornate Chestplate',
        'Titanium Ring',  'Studded Leather Armor',
      ]);

      // Claim loot bag with 'Studded Leather Armor'
      await loot.claim(1283);

      // Pledge 'Studded Leather Armor' to bounty
      await bounty.pledgeLootToBounty(1283, 1);

      // Should not have 'Studded Leather Armor' remaining anymore
      itemsRem = await bounty.getItemsRemaining(1);
      expect(itemsRem.slice(0, 10)).to.deep.equal([
        'Amulet',         'Grave Wand',
        'Plated Belt',    'Katana',
        'Leather Gloves', 'Maul',
        'Heavy Gloves',   'Ornate Chestplate',
        'Titanium Ring',  '',
      ]);

      // Claim loot bag with 'Leather Gloves', 'Amulet' and 'Maul'
      await loot.claim(1120);

      // Pledge 'Leather Gloves', 'Amulet' and 'Maul' to bounty
      await bounty.pledgeLootToBounty(1120, 1);

      // Should not have 'Studded Leather Armor', 'Leather Gloves', 'Amulet' or 'Maul' remaining anymore
      itemsRem = await bounty.getItemsRemaining(1);
      expect(itemsRem.slice(0, 10)).to.deep.equal([
        '',         'Grave Wand',
        'Plated Belt',    'Katana',
        '', '',
        'Heavy Gloves',   'Ornate Chestplate',
        'Titanium Ring',  '',
      ]);
    });
  });

  describe('pledgeLootToBounty()', () => {
    it('rejects loot pledge on unminted bounty', async () => {
      await expect(bounty.pledgeLootToBounty(7582, 4)).to.eventually.be.rejectedWith("BOUNTY_NOT_MINTED");
    });
    it('rejects loot pledge that doesnt contain unmet item requirement', async () => {
      await gold.approve(bounty.address, decimals.times(200));
      await bounty.mintHeroicBounty(); // Token 3
      await loot.claim(326);
      await expect(bounty.pledgeLootToBounty(326, 3)).to.eventually.be.rejectedWith("LOOT_MUST_CONTAIN_UNMET_ITEM_REQUIREMENT");
    });
    it('rejects duplicate loot pledge', async () => {
      await gold.approve(bounty.address, decimals.times(200));
      await bounty.mintLegendaryBounty(); // Token 2
      await bounty.pledgeLootToBounty(326, 2);
      await expect(bounty.pledgeLootToBounty(326, 2)).to.eventually.be.rejectedWith("LOOT_ALREADY_PLEDGED");
    });
  });

  describe('areBountyRequirementsMet() and completeBounty()', async () => {
    it('works as expected for heroic', async () => {
      const itemsRem = await bounty.getItemsRemaining(0);
      
      // Requires 'Holy Greaves' and 'Silver Ring' to complete
      expect(await bounty.areBountyRequirementsMet(0)).to.equal(false);
      expect(bounty.completeBounty(0)).to.eventually.be.rejectedWith('BOUNTY_REQUIREMENTS_NOT_MET');

      await loot.claim(1593);
      await bounty.pledgeLootToBounty(1593, 0);
      await loot.claim(3312);
      await bounty.pledgeLootToBounty(3312, 0);

      expect(await bounty.areBountyRequirementsMet(0)).to.equal(true);
      const initialGold = new BigNumber(await gold.balanceOf(accounts[0]));
      const initialGlory = new BigNumber(await glory.balanceOf(accounts[0]));
      await bounty.completeBounty(0)
      const finalGold = new BigNumber(await gold.balanceOf(accounts[0]));
      const finalGlory = new BigNumber(await glory.balanceOf(accounts[0]));
      expect(finalGold.minus(initialGold).isEqualTo(decimals.times(50))).to.be.true;
      expect(finalGlory.minus(initialGlory).isEqualTo(decimals.times(1000))).to.be.true;
      await expect(bounty.completeBounty(0)).to.eventually.be.rejectedWith('owner query for nonexistent token');
    });
    // it('works as expected for epic', async () => {
    //   const itemsRem = await bounty.getItemsRemaining(0);
      
    //   // Requires 'Holy Greaves' and 'Silver Ring' to complete
    //   expect(await bounty.areBountyRequirementsMet(0)).to.equal(false);
    //   expect(bounty.completeBounty(0)).to.eventually.be.rejectedWith('BOUNTY_REQUIREMENTS_NOT_MET');

    //   await loot.claim(1593);
    //   await bounty.pledgeLootToBounty(1593, 0);
    //   await loot.claim(3312);
    //   await bounty.pledgeLootToBounty(3312, 0);

    //   expect(await bounty.areBountyRequirementsMet(0)).to.equal(true);
    //   const initialGold = parseInt(await gold.balanceOf(accounts[0]));
    //   const initialGlory = parseInt(await glory.balanceOf(accounts[0]));
    //   await bounty.completeBounty(0)
    //   const finalGold = parseInt(await gold.balanceOf(accounts[0]));
    //   const finalGlory = parseInt(await glory.balanceOf(accounts[0]));
    //   expect(finalGold - initialGold).to.equal(50 * decimals);
    //   expect(finalGlory - initialGlory).to.equal(1000 * decimals);
    //   expect(bounty.completeBounty(0)).to.eventually.be.rejectedWith('MUST_OWN_BOUNTY_TOKEN');
    // });
  });

  describe('minting deducts the right amount of gold', () => {
    it('50 for heroic', async () => {
      await gold.approve(bounty.address, decimals.times(50));
      const initialGold = new BigNumber(await gold.balanceOf(accounts[0]));
      await bounty.mintHeroicBounty();
      const finalGold = new BigNumber(await gold.balanceOf(accounts[0]));
      expect(initialGold.minus(finalGold).isEqualTo(decimals.times(50))).to.be.true;
    });
    it('100 for epic', async () => {
      await gold.approve(bounty.address, decimals.times(100));
      const initialGold = new BigNumber(await gold.balanceOf(accounts[0]));
      await bounty.mintEpicBounty();
      const finalGold = new BigNumber(await gold.balanceOf(accounts[0]));
      expect(initialGold.minus(finalGold).isEqualTo(decimals.times(100))).to.be.true;
    });
    it('200 for legendary', async () => {
      await gold.approve(bounty.address, decimals.times(200));
      const initialGold = new BigNumber(await gold.balanceOf(accounts[0]));
      await bounty.mintLegendaryBounty();
      const finalGold = new BigNumber(await gold.balanceOf(accounts[0]));
      expect(initialGold.minus(finalGold).isEqualTo(decimals.times(200))).to.be.true;
    });
  });

  // TODO: Complete test
});