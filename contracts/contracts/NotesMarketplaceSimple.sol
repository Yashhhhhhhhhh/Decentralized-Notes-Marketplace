// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NotesMarketplace (Simplified)
 * @dev A streamlined decentralized marketplace for trading study notes as NFTs
 */
contract NotesMarketplace is ERC721, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    uint256 public platformFee = 250; // 2.5% platform fee
    
    struct Note {
        uint256 id;
        string title;
        string description;
        string ipfsHash;
        address author;
        uint256 price;
        bool forSale;
        string subject;
        uint8 rating;
        uint256 ratingCount;
        uint256 downloadCount;
    }

    mapping(uint256 => Note) public notes;
    mapping(address => uint256[]) public authorNotes;
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    mapping(address => uint256) public authorEarnings;
    mapping(uint256 => mapping(address => uint8)) public userRatings;

    event NoteCreated(uint256 indexed tokenId, address indexed author, string title, uint256 price);
    event NotePurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event NoteRated(uint256 indexed tokenId, address indexed rater, uint8 rating);

    constructor() ERC721("NotesMarketplace", "NOTES") Ownable(msg.sender) {}

    function createNote(
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 price,
        string memory subject
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(price > 0, "Price must be greater than 0");

        uint256 tokenId = _tokenIdCounter++;

        notes[tokenId] = Note({
            id: tokenId,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            author: msg.sender,
            price: price,
            forSale: true,
            subject: subject,
            rating: 0,
            ratingCount: 0,
            downloadCount: 0
        });

        authorNotes[msg.sender].push(tokenId);
        _safeMint(msg.sender, tokenId);

        emit NoteCreated(tokenId, msg.sender, title, price);
        return tokenId;
    }

    function purchaseNote(uint256 tokenId) external payable nonReentrant {
        Note storage note = notes[tokenId];
        require(note.forSale, "Note is not for sale");
        require(msg.value >= note.price, "Insufficient payment");
        require(msg.sender != note.author, "Cannot buy your own note");
        require(!hasPurchased[msg.sender][tokenId], "Already purchased");

        uint256 fee = (note.price * platformFee) / 10000;
        uint256 authorPayment = note.price - fee;

        hasPurchased[msg.sender][tokenId] = true;
        note.downloadCount++;
        authorEarnings[note.author] += authorPayment;

        if (msg.value > note.price) {
            payable(msg.sender).transfer(msg.value - note.price);
        }

        emit NotePurchased(tokenId, msg.sender, note.price);
    }

    function rateNote(uint256 tokenId, uint8 rating) external {
        require(hasPurchased[msg.sender][tokenId], "Must purchase to rate");
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(userRatings[tokenId][msg.sender] == 0, "Already rated");

        Note storage note = notes[tokenId];
        userRatings[tokenId][msg.sender] = rating;
        
        // Simple rating calculation
        uint256 totalRating = (uint256(note.rating) * note.ratingCount) + rating;
        note.ratingCount++;
        note.rating = uint8(totalRating / note.ratingCount);

        emit NoteRated(tokenId, msg.sender, rating);
    }

    function withdrawEarnings() external nonReentrant {
        uint256 earnings = authorEarnings[msg.sender];
        require(earnings > 0, "No earnings");

        authorEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(earnings);
    }

    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        require(notes[tokenId].author == msg.sender, "Not author");
        require(newPrice > 0, "Invalid price");
        notes[tokenId].price = newPrice;
    }

    function toggleSale(uint256 tokenId) external {
        require(notes[tokenId].author == msg.sender, "Not author");
        notes[tokenId].forSale = !notes[tokenId].forSale;
    }

    // View functions
    function getNotesByAuthor(address author) external view returns (uint256[] memory) {
        return authorNotes[author];
    }

    function getTotalNotes() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function hasUserPurchased(address user, uint256 tokenId) external view returns (bool) {
        return hasPurchased[user][tokenId];
    }

    // Admin functions
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Max 10%");
        platformFee = newFee;
    }

    function withdrawPlatformFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked("ipfs://", notes[tokenId].ipfsHash));
    }

    receive() external payable {}
}
