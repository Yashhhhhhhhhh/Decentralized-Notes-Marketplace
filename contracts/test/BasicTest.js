const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NotesMarketplace Basic Test", function () {
  let notesMarketplace;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const NotesMarketplace = await ethers.getContractFactory("NotesMarketplace");
    notesMarketplace = await NotesMarketplace.deploy();
    await notesMarketplace.deployed(); // Use deployed() for older ethers
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(notesMarketplace.address).to.be.properAddress;
    });

    it("Should set the right owner", async function () {
      expect(await notesMarketplace.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct platform fee", async function () {
      expect(await notesMarketplace.platformFee()).to.equal(250);
    });

    it("Should start unpaused", async function () {
      expect(await notesMarketplace.paused()).to.equal(false);
    });
  });
});
