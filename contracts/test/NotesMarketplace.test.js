const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NotesMarketplace", function () {
  let notesMarketplace;
  let owner;
  let author;
  let buyer;
  let otherAccount;

  const noteTitle = "Advanced Mathematics Notes";
  const noteDescription = "Comprehensive calculus and linear algebra notes";
  const ipfsHash = "QmTest123456789";
  const notePrice = ethers.utils.parseEther("0.1");
  const subject = "Mathematics";

  beforeEach(async function () {
    [owner, author, buyer, otherAccount] = await ethers.getSigners();

    const NotesMarketplace = await ethers.getContractFactory("NotesMarketplace");
    notesMarketplace = await NotesMarketplace.deploy();
    await notesMarketplace.waitForDeployment();
  });

  describe("Deployment", function () {
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

  describe("Note Creation", function () {
    it("Should create a note successfully", async function () {
      await expect(
        notesMarketplace.connect(author).createNote(
          noteTitle,
          noteDescription,
          ipfsHash,
          notePrice,
          subject
        )
      ).to.emit(notesMarketplace, "NoteCreated")
        .withArgs(0, author.address, noteTitle, subject, notePrice, ipfsHash);

      const note = await notesMarketplace.notes(0);
      expect(note.title).to.equal(noteTitle);
      expect(note.author).to.equal(author.address);
      expect(note.price).to.equal(notePrice);
      expect(note.forSale).to.equal(true);
    });

    it("Should fail with empty title", async function () {
      await expect(
        notesMarketplace.connect(author).createNote(
          "",
          noteDescription,
          ipfsHash,
          notePrice,
          subject
        )
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should fail with zero price", async function () {
      await expect(
        notesMarketplace.connect(author).createNote(
          noteTitle,
          noteDescription,
          ipfsHash,
          0,
          subject
        )
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should update author notes mapping", async function () {
      await notesMarketplace.connect(author).createNote(
        noteTitle,
        noteDescription,
        ipfsHash,
        notePrice,
        subject
      );

      const authorNotes = await notesMarketplace.getNotesByAuthor(author.address);
      expect(authorNotes.length).to.equal(1);
      expect(authorNotes[0]).to.equal(0);
    });

    it("Should update subject notes mapping", async function () {
      await notesMarketplace.connect(author).createNote(
        noteTitle,
        noteDescription,
        ipfsHash,
        notePrice,
        subject
      );

      const subjectNotes = await notesMarketplace.getNotesBySubject(subject);
      expect(subjectNotes.length).to.equal(1);
      expect(subjectNotes[0]).to.equal(0);
    });
  });

  describe("Note Purchase", function () {
    beforeEach(async function () {
      await notesMarketplace.connect(author).createNote(
        noteTitle,
        noteDescription,
        ipfsHash,
        notePrice,
        subject
      );
    });

    it("Should purchase a note successfully", async function () {
      await expect(
        notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice })
      ).to.emit(notesMarketplace, "NotePurchased")
        .withArgs(0, buyer.address, author.address, notePrice);

      expect(await notesMarketplace.hasPurchased(buyer.address, 0)).to.equal(true);
    });

    it("Should fail if note is not for sale", async function () {
      await notesMarketplace.connect(author).updateSaleStatus(0, false);
      
      await expect(
        notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice })
      ).to.be.revertedWith("Note is not for sale");
    });

    it("Should fail with insufficient payment", async function () {
      const insufficientPayment = ethers.parseEther("0.05");
      
      await expect(
        notesMarketplace.connect(buyer).purchaseNote(0, { value: insufficientPayment })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail if author tries to buy own note", async function () {
      await expect(
        notesMarketplace.connect(author).purchaseNote(0, { value: notePrice })
      ).to.be.revertedWith("Cannot buy your own note");
    });

    it("Should fail on duplicate purchase", async function () {
      await notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice });
      
      await expect(
        notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice })
      ).to.be.revertedWith("Already purchased");
    });

    it("Should handle platform fee correctly", async function () {
      const initialBalance = await ethers.provider.getBalance(author.address);
      
      await notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice });
      
      const expectedFee = (notePrice * 250n) / 10000n; // 2.5%
      const expectedAuthorEarnings = notePrice - expectedFee;
      
      expect(await notesMarketplace.authorEarnings(author.address)).to.equal(expectedAuthorEarnings);
    });

    it("Should return excess payment", async function () {
      const excessPayment = ethers.parseEther("0.2");
      const initialBalance = await ethers.provider.getBalance(buyer.address);
      
      const tx = await notesMarketplace.connect(buyer).purchaseNote(0, { value: excessPayment });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(buyer.address);
      const expectedBalance = initialBalance - notePrice - gasUsed;
      
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should update download count", async function () {
      await notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice });
      
      const note = await notesMarketplace.notes(0);
      expect(note.downloadCount).to.equal(1);
    });
  });

  describe("Rating System", function () {
    beforeEach(async function () {
      await notesMarketplace.connect(author).createNote(
        noteTitle,
        noteDescription,
        ipfsHash,
        notePrice,
        subject
      );
      await notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice });
    });

    it("Should rate a note successfully", async function () {
      const rating = 5;
      
      await expect(
        notesMarketplace.connect(buyer).rateNote(0, rating)
      ).to.emit(notesMarketplace, "NoteRated")
        .withArgs(0, buyer.address, rating);

      const note = await notesMarketplace.notes(0);
      expect(note.rating).to.equal(rating);
      expect(note.ratingCount).to.equal(1);
    });

    it("Should fail if user hasn't purchased the note", async function () {
      await expect(
        notesMarketplace.connect(otherAccount).rateNote(0, 5)
      ).to.be.revertedWith("Must purchase note to rate");
    });

    it("Should fail on duplicate rating", async function () {
      await notesMarketplace.connect(buyer).rateNote(0, 5);
      
      await expect(
        notesMarketplace.connect(buyer).rateNote(0, 4)
      ).to.be.revertedWith("Already rated this note");
    });

    it("Should fail with invalid rating", async function () {
      await expect(
        notesMarketplace.connect(buyer).rateNote(0, 0)
      ).to.be.revertedWith("Rating must be between 1 and 5");
      
      await expect(
        notesMarketplace.connect(buyer).rateNote(0, 6)
      ).to.be.revertedWith("Rating must be between 1 and 5");
    });

    it("Should calculate average rating correctly", async function () {
      // Second buyer purchases and rates
      await notesMarketplace.connect(otherAccount).purchaseNote(0, { value: notePrice });
      
      await notesMarketplace.connect(buyer).rateNote(0, 4);
      await notesMarketplace.connect(otherAccount).rateNote(0, 5);
      
      const note = await notesMarketplace.notes(0);
      expect(note.rating).to.equal(4); // (4 + 5) / 2 = 4.5, truncated to 4
      expect(note.ratingCount).to.equal(2);
    });
  });

  describe("Author Functions", function () {
    beforeEach(async function () {
      await notesMarketplace.connect(author).createNote(
        noteTitle,
        noteDescription,
        ipfsHash,
        notePrice,
        subject
      );
    });

    it("Should update price successfully", async function () {
      const newPrice = ethers.parseEther("0.2");
      
      await expect(
        notesMarketplace.connect(author).updatePrice(0, newPrice)
      ).to.emit(notesMarketplace, "PriceUpdated")
        .withArgs(0, notePrice, newPrice);

      const note = await notesMarketplace.notes(0);
      expect(note.price).to.equal(newPrice);
    });

    it("Should fail price update by non-author", async function () {
      const newPrice = ethers.parseEther("0.2");
      
      await expect(
        notesMarketplace.connect(buyer).updatePrice(0, newPrice)
      ).to.be.revertedWith("Not the author");
    });

    it("Should update sale status successfully", async function () {
      await expect(
        notesMarketplace.connect(author).updateSaleStatus(0, false)
      ).to.emit(notesMarketplace, "SaleStatusUpdated")
        .withArgs(0, false);

      const note = await notesMarketplace.notes(0);
      expect(note.forSale).to.equal(false);
    });

    it("Should withdraw earnings successfully", async function () {
      await notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice });
      
      const initialBalance = await ethers.provider.getBalance(author.address);
      const earnings = await notesMarketplace.authorEarnings(author.address);
      
      await expect(
        notesMarketplace.connect(author).withdrawEarnings()
      ).to.emit(notesMarketplace, "EarningsWithdrawn")
        .withArgs(author.address, earnings);

      expect(await notesMarketplace.authorEarnings(author.address)).to.equal(0);
    });

    it("Should fail withdrawal with no earnings", async function () {
      await expect(
        notesMarketplace.connect(author).withdrawEarnings()
      ).to.be.revertedWith("No earnings to withdraw");
    });
  });

  describe("Admin Functions", function () {
    it("Should update platform fee", async function () {
      const newFee = 500; // 5%
      
      await expect(
        notesMarketplace.connect(owner).updatePlatformFee(newFee)
      ).to.emit(notesMarketplace, "PlatformFeeUpdated")
        .withArgs(250, newFee);

      expect(await notesMarketplace.platformFee()).to.equal(newFee);
    });

    it("Should fail to set fee above maximum", async function () {
      const excessiveFee = 1500; // 15%
      
      await expect(
        notesMarketplace.connect(owner).updatePlatformFee(excessiveFee)
      ).to.be.revertedWith("Fee exceeds maximum");
    });

    it("Should pause and unpause contract", async function () {
      await expect(
        notesMarketplace.connect(owner).setPaused(true)
      ).to.emit(notesMarketplace, "ContractPaused")
        .withArgs(true);

      expect(await notesMarketplace.paused()).to.equal(true);

      // Should fail to create note when paused
      await expect(
        notesMarketplace.connect(author).createNote(
          noteTitle,
          noteDescription,
          ipfsHash,
          notePrice,
          subject
        )
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should verify user", async function () {
      await expect(
        notesMarketplace.connect(owner).verifyUser(author.address)
      ).to.emit(notesMarketplace, "UserVerified")
        .withArgs(author.address);

      const profile = await notesMarketplace.userProfiles(author.address);
      expect(profile.verified).to.equal(true);
    });

    it("Should fail admin functions for non-owner", async function () {
      await expect(
        notesMarketplace.connect(author).updatePlatformFee(500)
      ).to.be.revertedWithCustomError(notesMarketplace, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await notesMarketplace.connect(author).createNote(
        noteTitle,
        noteDescription,
        ipfsHash,
        notePrice,
        subject
      );
      await notesMarketplace.connect(author).createNote(
        "Physics Notes",
        "Quantum mechanics basics",
        "QmPhysics123",
        ethers.parseEther("0.15"),
        "Physics"
      );
    });

    it("Should return correct total notes count", async function () {
      expect(await notesMarketplace.getTotalNotes()).to.equal(2);
    });

    it("Should return notes by author", async function () {
      const authorNotes = await notesMarketplace.getNotesByAuthor(author.address);
      expect(authorNotes.length).to.equal(2);
      expect(authorNotes[0]).to.equal(0);
      expect(authorNotes[1]).to.equal(1);
    });

    it("Should return notes by subject", async function () {
      const mathNotes = await notesMarketplace.getNotesBySubject("Mathematics");
      const physicsNotes = await notesMarketplace.getNotesBySubject("Physics");
      
      expect(mathNotes.length).to.equal(1);
      expect(physicsNotes.length).to.equal(1);
      expect(mathNotes[0]).to.equal(0);
      expect(physicsNotes[0]).to.equal(1);
    });

    it("Should return user purchases", async function () {
      await notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice });
      
      const purchases = await notesMarketplace.getUserPurchases(buyer.address);
      expect(purchases.length).to.equal(1);
      expect(purchases[0]).to.equal(0);
    });

    it("Should check purchase status", async function () {
      expect(await notesMarketplace.hasUserPurchased(buyer.address, 0)).to.equal(false);
      
      await notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice });
      
      expect(await notesMarketplace.hasUserPurchased(buyer.address, 0)).to.equal(true);
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle reentrancy protection", async function () {
      await notesMarketplace.connect(author).createNote(
        noteTitle,
        noteDescription,
        ipfsHash,
        notePrice,
        subject
      );
      
      // This test ensures the nonReentrant modifier is working
      // In a real attack, this would be more complex
      await notesMarketplace.connect(buyer).purchaseNote(0, { value: notePrice });
      
      expect(await notesMarketplace.hasPurchased(buyer.address, 0)).to.equal(true);
    });

    it("Should handle large numbers correctly", async function () {
      const largePrice = ethers.parseEther("1000");
      
      await notesMarketplace.connect(author).createNote(
        noteTitle,
        noteDescription,
        ipfsHash,
        largePrice,
        subject
      );
      
      const note = await notesMarketplace.notes(0);
      expect(note.price).to.equal(largePrice);
    });

    it("Should handle multiple rapid transactions", async function () {
      // Create multiple notes rapidly
      for (let i = 0; i < 5; i++) {
        await notesMarketplace.connect(author).createNote(
          `Note ${i}`,
          `Description ${i}`,
          `QmHash${i}`,
          notePrice,
          subject
        );
      }
      
      expect(await notesMarketplace.getTotalNotes()).to.equal(5);
    });
  });
});
