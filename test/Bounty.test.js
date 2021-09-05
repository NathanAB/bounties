// Set up a Truffle contract, representing our deployed Box instance
const Gold = artifacts.require('AdventureGold');
const Loot = artifacts.require('Loot');
const Bounty = artifacts.require('Bounty');

// // scripts/index.js
// module.exports = async function main (callback) {
//   try {
//     // Our code will go here
//     const gold = await Gold.deployed();
//     const loot = await Loot.deployed();
//     const bounty = await Bounty.deployed();

//     // gold.daoSetLootContractAddress(loot.address);

//     // console.log(await loot.claim(123));
//     // console.log(await gold.claimById(123));
//     // console.log(await bounty.approve());
//     // console.log(await bounty.mintLegendaryBounty());
//     // console.log(await bounty.balanceOf(accounts[0]));

//     console.log(await bounty.getBountyRequirements(0));
//     console.log(await bounty.getBountyReward(0));
//     console.log(await bounty.getBountyRequirements(1));
//     console.log(await bounty.getBountyReward(1));
//     console.log(await bounty.getBountyRequirements(2));
//     console.log(await bounty.getBountyReward(2));
//     callback(0);
//   } catch (error) {
//     console.error(error);
//     callback(1);
//   }
// };

contract("Bounty", accounts => {
  let bounty;
  let gold;
  let loot;

  beforeEach(async () => {
    bounty = await Bounty.deployed();
    gold = await Gold.deployed();
    loot = await Loot.deployed();
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
        '0,0,0,0,0,0'
      ]
      const expectedText = ["Amulet", "Grave Wand", "Plated Belt", "Katana"];

      expect(reqNumbers.slice(0, 11)).to.deep.equal(expectedNumbers);
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
      expect(tokenUri).to.equal('eyJuYW1lIjogIkJvdW50eSAjNiIsICJkZXNjcmlwdGlvbiI6ICJCb3VudGllcyBjYW4gYmUgcmVkZWVtZWQgZm9yIGdsb3J5IHdoZW4gbXVsdGlwbGUgYWR2ZW50dXJlcnMgY29vcmRpbmF0ZSB0byBjb21wbGV0ZSB0aGUgcmVxdWlyZW1lbnRzLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSEJ5WlhObGNuWmxRWE53WldOMFVtRjBhVzg5SW5oTmFXNVpUV2x1SUcxbFpYUWlJSFpwWlhkQ2IzZzlJakFnTUNBek5UQWdNelV3SWo0OGMzUjViR1UrTG1KaGMyVWdleUJtYVd4c09pQjNhR2wwWlRzZ1ptOXVkQzFtWVcxcGJIazZJSE5sY21sbU95Qm1iMjUwTFhOcGVtVTZJREV5Y0hnN0lIMDhMM04wZVd4bFBqeHlaV04wSUhkcFpIUm9QU0l4TURBbElpQm9aV2xuYUhROUlqRXdNQ1VpSUdacGJHdzlJbUpzWVdOcklpQXZQangwWlhoMElIZzlJakV3SWlCNVBTSXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRWdTRVZTVDBsRElHSnZkVzUwZVNCb1lYTWdZbVZsYmlCd2IzTjBaV1FnZEc4Z2MyeGhlU0IwYUdVOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJak0xSWlCamJHRnpjejBpWW1GelpTSStSazlTVTBGTFJVNGdVa0ZRVkU5U0lIUmxjbkp2Y21sNmFXNW5JRzkxY2lCc1lXNWtjeUU4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqY3dJaUJqYkdGemN6MGlZbUZ6WlNJK1ZHOGdZMjl0Y0d4bGRHVWdkR2hsSUdKdmRXNTBlU3dnWjJGMGFHVnlJSGx2ZFhJZ1ptVnNiRzkzSUdGa2RtVnVkSFZ5WlhKelBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0k0TlNJZ1kyeGhjM005SW1KaGMyVWlQbmRvYnlCb2IyeGtJSFJvWlNCeVpYRjFhWEpsWkNCcGRHVnRjem84TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqRXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRnRkV3hsZER3dmRHVjRkRDQ4ZEdWNGRDQjRQU0l4TUNJZ2VUMGlNVE0xSWlCamJHRnpjejBpWW1GelpTSStUbVZqYTJ4aFkyVThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpFMU1DSWdZMnhoYzNNOUltSmhjMlVpUGtOb1lXbHVJRTFoYVd3OEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJakUyTlNJZ1kyeGhjM005SW1KaGMyVWlQbEJsYm1SaGJuUThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpNek1DSWdZMnhoYzNNOUltSmhjMlVpUGtFZ2NtVjNZWEprSUc5bUlPS2NxUENkbjVud25aK1k4SjJmbVBDZG41Z2c4SjJVdnZDZGxZUHduWldHNG9TZDhKMlZrT0tjcUNCemFHRnNiQ0JpWlNCemNHeHBkQ0JoYlc5dVp5QjBhR1VnY0dGeWRIa3VQQzkwWlhoMFBqd3ZjM1puUGc9PSJ9');
    });

    it('bounty 7', async () => {
      const tokenUri = await bounty.tokenURI(7);
      expect(tokenUri).to.equal('eyJuYW1lIjogIkJvdW50eSAjNyIsICJkZXNjcmlwdGlvbiI6ICJCb3VudGllcyBjYW4gYmUgcmVkZWVtZWQgZm9yIGdsb3J5IHdoZW4gbXVsdGlwbGUgYWR2ZW50dXJlcnMgY29vcmRpbmF0ZSB0byBjb21wbGV0ZSB0aGUgcmVxdWlyZW1lbnRzLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSEJ5WlhObGNuWmxRWE53WldOMFVtRjBhVzg5SW5oTmFXNVpUV2x1SUcxbFpYUWlJSFpwWlhkQ2IzZzlJakFnTUNBek5UQWdNelV3SWo0OGMzUjViR1UrTG1KaGMyVWdleUJtYVd4c09pQjNhR2wwWlRzZ1ptOXVkQzFtWVcxcGJIazZJSE5sY21sbU95Qm1iMjUwTFhOcGVtVTZJREV5Y0hnN0lIMDhMM04wZVd4bFBqeHlaV04wSUhkcFpIUm9QU0l4TURBbElpQm9aV2xuYUhROUlqRXdNQ1VpSUdacGJHdzlJbUpzWVdOcklpQXZQangwWlhoMElIZzlJakV3SWlCNVBTSXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRnVJT0tkbCsrNGowVlFTVVBpblpmdnVJOGdZbTkxYm5SNUlHaGhjeUJpWldWdUlIQnZjM1JsWkNCMGJ5QnpiR0Y1SUhSb1pUd3ZkR1Y0ZEQ0OGRHVjRkQ0I0UFNJeE1DSWdlVDBpTXpVaUlHTnNZWE56UFNKaVlYTmxJajVEVDFKU1ZWQlVSVVFnVjBWU1JWZFBURVlnZEdWeWNtOXlhWHBwYm1jZ2IzVnlJR3hoYm1SeklUd3ZkR1Y0ZEQ0OGRHVjRkQ0I0UFNJeE1DSWdlVDBpTnpBaUlHTnNZWE56UFNKaVlYTmxJajVVYnlCamIyMXdiR1YwWlNCMGFHVWdZbTkxYm5SNUxDQm5ZWFJvWlhJZ2VXOTFjaUJtWld4c2IzY2dZV1IyWlc1MGRYSmxjbk04TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqZzFJaUJqYkdGemN6MGlZbUZ6WlNJK2QyaHZJR2h2YkdRZ2RHaGxJSEpsY1hWcGNtVmtJR2wwWlcxek9qd3ZkR1Y0ZEQ0OGRHVjRkQ0I0UFNJeE1DSWdlVDBpTVRJd0lpQmpiR0Z6Y3owaVltRnpaU0krUVcxMWJHVjBQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRXdJaUI1UFNJeE16VWlJR05zWVhOelBTSmlZWE5sSWo1SGNtVmhkbVZ6UEM5MFpYaDBQangwWlhoMElIZzlJakV3SWlCNVBTSXhOVEFpSUdOc1lYTnpQU0ppWVhObElqNVBjbTVoZEdVZ1FtVnNkRHd2ZEdWNGRENDhkR1Y0ZENCNFBTSXhNQ0lnZVQwaU1UWTFJaUJqYkdGemN6MGlZbUZ6WlNJK1RHVmhkR2hsY2lCRFlYQThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpFNE1DSWdZMnhoYzNNOUltSmhjMlVpUGtSeVlXZHZibk5yYVc0Z1FYSnRiM0k4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqRTVOU0lnWTJ4aGMzTTlJbUpoYzJVaVBsTjBkV1JrWldRZ1RHVmhkR2hsY2lCQ1pXeDBQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRXdJaUI1UFNJeU1UQWlJR05zWVhOelBTSmlZWE5sSWo1RWNtRm5iMjV6YTJsdUlFSmxiSFE4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqTXpNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRWdjbVYzWVhKa0lHOW1JT0tjcVBDZG41cnduWitZOEoyZm1QQ2RuNWdnOEoyVXZ2Q2RsWVB3blpXRzRvU2Q4SjJWa09LY3FDQnphR0ZzYkNCaVpTQnpjR3hwZENCaGJXOXVaeUIwYUdVZ2NHRnlkSGt1UEM5MFpYaDBQand2YzNablBnPT0ifQ==');
    });

    it('bounty 8', async () => {
      const tokenUri = await bounty.tokenURI(8);
      expect(tokenUri).to.equal('eyJuYW1lIjogIkJvdW50eSAjOCIsICJkZXNjcmlwdGlvbiI6ICJCb3VudGllcyBjYW4gYmUgcmVkZWVtZWQgZm9yIGdsb3J5IHdoZW4gbXVsdGlwbGUgYWR2ZW50dXJlcnMgY29vcmRpbmF0ZSB0byBjb21wbGV0ZSB0aGUgcmVxdWlyZW1lbnRzLiIsICJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSEJ5WlhObGNuWmxRWE53WldOMFVtRjBhVzg5SW5oTmFXNVpUV2x1SUcxbFpYUWlJSFpwWlhkQ2IzZzlJakFnTUNBek5UQWdNelV3SWo0OGMzUjViR1UrTG1KaGMyVWdleUJtYVd4c09pQjNhR2wwWlRzZ1ptOXVkQzFtWVcxcGJIazZJSE5sY21sbU95Qm1iMjUwTFhOcGVtVTZJREV5Y0hnN0lIMDhMM04wZVd4bFBqeHlaV04wSUhkcFpIUm9QU0l4TURBbElpQm9aV2xuYUhROUlqRXdNQ1VpSUdacGJHdzlJbUpzWVdOcklpQXZQangwWlhoMElIZzlJakV3SWlCNVBTSXlNQ0lnWTJ4aGMzTTlJbUpoYzJVaVBrRWc0b0M4NzdpUFRFVkhSVTVFUVZKWjRvQzg3N2lQSUdKdmRXNTBlU0JvWVhNZ1ltVmxiaUJ3YjNOMFpXUWdkRzhnYzJ4aGVTQjBhR1U4TDNSbGVIUStQSFJsZUhRZ2VEMGlNVEFpSUhrOUlqTTFJaUJqYkdGemN6MGlZbUZ6WlNJK1FVNURTVVZPVkNCUVNWUWdSa2xGVGtRZ2RHVnljbTl5YVhwcGJtY2diM1Z5SUd4aGJtUnpJVHd2ZEdWNGRENDhkR1Y0ZENCNFBTSXhNQ0lnZVQwaU56QWlJR05zWVhOelBTSmlZWE5sSWo1VWJ5QmpiMjF3YkdWMFpTQjBhR1VnWW05MWJuUjVMQ0JuWVhSb1pYSWdlVzkxY2lCbVpXeHNiM2NnWVdSMlpXNTBkWEpsY25NOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJamcxSWlCamJHRnpjejBpWW1GelpTSStkMmh2SUdodmJHUWdkR2hsSUhKbGNYVnBjbVZrSUdsMFpXMXpPand2ZEdWNGRENDhkR1Y0ZENCNFBTSXhNQ0lnZVQwaU1USXdJaUJqYkdGemN6MGlZbUZ6WlNJK1NHOXNlU0JIY21WaGRtVnpQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRXdJaUI1UFNJeE16VWlJR05zWVhOelBTSmlZWE5sSWo1SVlYSmtJRXhsWVhSb1pYSWdRbTl2ZEhNOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJakUxTUNJZ1kyeGhjM005SW1KaGMyVWlQbFJ2YldVOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRBaUlIazlJakUyTlNJZ1kyeGhjM005SW1KaGMyVWlQazl5Ym1GMFpTQkhjbVZoZG1WelBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0l4T0RBaUlHTnNZWE56UFNKaVlYTmxJajVRYkdGMGFXNTFiU0JTYVc1blBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0l4T1RVaUlHTnNZWE56UFNKaVlYTmxJajVVYVhSaGJtbDFiU0JTYVc1blBDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0l5TVRBaUlHTnNZWE56UFNKaVlYTmxJajVFY21GbmIyNXphMmx1SUVKbGJIUThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UQWlJSGs5SWpJeU5TSWdZMnhoYzNNOUltSmhjMlVpUGxkaGNpQkNaV3gwUEM5MFpYaDBQangwWlhoMElIZzlJakV3SWlCNVBTSXlOREFpSUdOc1lYTnpQU0ppWVhObElqNU5aWE5vSUVKbGJIUThMM1JsZUhRK1BIUmxlSFFnZUQwaU1UWTFJaUI1UFNJeE1qQWlJR05zWVhOelBTSmlZWE5sSWo1WGIyOXNJRk5oYzJnOEwzUmxlSFErUEhSbGVIUWdlRDBpTVRZMUlpQjVQU0l4TXpVaUlHTnNZWE56UFNKaVlYTmxJajVUZEhWa1pHVmtJRXhsWVhSb1pYSWdRbVZzZER3dmRHVjRkRDQ4ZEdWNGRDQjRQU0l4TmpVaUlIazlJakUxTUNJZ1kyeGhjM005SW1KaGMyVWlQa1JsYlc5dUlFTnliM2R1UEM5MFpYaDBQangwWlhoMElIZzlJakUyTlNJZ2VUMGlNVFkxSWlCamJHRnpjejBpWW1GelpTSStVR1Z1WkdGdWREd3ZkR1Y0ZEQ0OGRHVjRkQ0I0UFNJeE5qVWlJSGs5SWpFNE1DSWdZMnhoYzNNOUltSmhjMlVpUGxOb2FYSjBQQzkwWlhoMFBqeDBaWGgwSUhnOUlqRTJOU0lnZVQwaU1UazFJaUJqYkdGemN6MGlZbUZ6WlNJK1VtbHVaeUJOWVdsc1BDOTBaWGgwUGp4MFpYaDBJSGc5SWpFd0lpQjVQU0l6TXpBaUlHTnNZWE56UFNKaVlYTmxJajVCSUhKbGQyRnlaQ0J2WmlEaW5LanduWitkOEoyZm1QQ2RuNWp3blorWUlQQ2RsTDd3blpXRDhKMlZodUtFbmZDZGxaRGluS2dnYzJoaGJHd2dZbVVnYzNCc2FYUWdZVzF2Ym1jZ2RHaGxJSEJoY25SNUxqd3ZkR1Y0ZEQ0OEwzTjJaejQ9In0=');
    });
  });

  describe.only('full test', () => {
    it('bounty 1', async () => {
      await gold.approve(bounty.address, 100000);
      
      console.log(await bounty.mintHeroicBounty());
      const itemsRem = await bounty.getItemsRemaining(0);

      console.log(itemsRem);
    });
  });
});