// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NotesMarketplace
 * @dev A decentralized marketplace for trading study notes as NFTs
 * @notice This contract allows users to mint, buy, sell, and rate study notes
 */
contract NotesMarketplace is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    // State variables
    uint256 private _tokenIdCounter;
    uint256 public platformFee = 250; // 2.5% platform fee (in basis points)
    uint256 public constant MAX_PLATFORM_FEE = 1000; // Maximum 10% platform fee
    bool public paused = false;

    // Structs
    struct Note {
        uint256 id;
        string title;
        string description;
        string ipfsHash;
        address author;
        uint256 price;
        bool forSale;
        uint256 createdAt;
        string subject;
        uint8 rating;
        uint256 ratingCount;
        uint256 totalRating;
        uint256 downloadCount;
    }

    struct UserProfile {
        string name;
        string bio;
        bool verified;
        uint256 totalEarnings;
        uint256 notesCreated;
        uint8 reputation;
    }

    // Mappings
    mapping(uint256 => Note) public notes;
    mapping(address => uint256[]) public authorNotes;
    mapping(string => uint256[]) public subjectNotes;
    mapping(uint256 => mapping(address => uint8)) public userRatings;
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    mapping(address => uint256) public authorEarnings;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => uint256[]) public userPurchases;

    // Events
    event NoteCreated(
        uint256 indexed tokenId,
        address indexed author,
        string title,
        string subject,
        uint256 price,
        string ipfsHash
    );

    event NotePurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    event NoteRated(
        uint256 indexed tokenId,
        address indexed rater,
        uint8 rating
    );

    event PriceUpdated(
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );

    event SaleStatusUpdated(
        uint256 indexed tokenId,
        bool forSale
    );

    event EarningsWithdrawn(
        address indexed author,
        uint256 amount
    );

    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );

    event ContractPaused(bool paused);

    event UserVerified(address indexed user);

    // Modifiers
    modifier onlyAuthor(uint256 tokenId) {
        require(notes[tokenId].author == msg.sender, "Not the author");
        _;
    }

    modifier noteExists(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Note does not exist");
        _;
    }

    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier validPrice(uint256 price) {
        require(price > 0, "Price must be greater than 0");
        _;
    }

    modifier validRating(uint8 rating) {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        _;
    }

    constructor() ERC721("NotesMarketplace", "NOTES") Ownable(msg.sender) {}

    /**
     * @dev Creates a new note NFT
     * @param title The title of the note
     * @param description The description of the note
     * @param ipfsHash The IPFS hash of the note file
     * @param price The price of the note in Wei
     * @param subject The subject category of the note
     * @return tokenId The ID of the created note
     */
    function createNote(
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 price,
        string memory subject
    ) external notPaused validPrice(price) returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(subject).length > 0, "Subject cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Create the note
        notes[tokenId] = Note({
            id: tokenId,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            author: msg.sender,
            price: price,
            forSale: true,
            createdAt: block.timestamp,
            subject: subject,
            rating: 0,
            ratingCount: 0,
            totalRating: 0,
            downloadCount: 0
        });

        // Update mappings
        authorNotes[msg.sender].push(tokenId);
        subjectNotes[subject].push(tokenId);

        // Update user profile
        userProfiles[msg.sender].notesCreated++;

        // Mint the NFT
        _safeMint(msg.sender, tokenId);

        emit NoteCreated(tokenId, msg.sender, title, subject, price, ipfsHash);

        return tokenId;
    }

    /**
     * @dev Purchases a note NFT
     * @param tokenId The ID of the note to purchase
     */
    function purchaseNote(uint256 tokenId) 
        external 
        payable 
        nonReentrant 
        notPaused 
        noteExists(tokenId) 
    {
        Note storage note = notes[tokenId];
        require(note.forSale, "Note is not for sale");
        require(msg.value >= note.price, "Insufficient payment");
        require(msg.sender != note.author, "Cannot buy your own note");
        require(!hasPurchased[msg.sender][tokenId], "Already purchased");

        address seller = note.author;
        uint256 salePrice = note.price;

        // Calculate platform fee
        uint256 fee = (salePrice * platformFee) / 10000;
        uint256 authorPayment = salePrice - fee;

        // Update state
        hasPurchased[msg.sender][tokenId] = true;
        userPurchases[msg.sender].push(tokenId);
        note.downloadCount++;
        authorEarnings[seller] += authorPayment;
        userProfiles[seller].totalEarnings += authorPayment;

        // Handle excess payment
        if (msg.value > salePrice) {
            payable(msg.sender).transfer(msg.value - salePrice);
        }

        emit NotePurchased(tokenId, msg.sender, seller, salePrice);
    }

    /**
     * @dev Rates a purchased note
     * @param tokenId The ID of the note to rate
     * @param rating The rating (1-5)
     */
    function rateNote(uint256 tokenId, uint8 rating) 
        external 
        noteExists(tokenId) 
        validRating(rating) 
    {
        require(hasPurchased[msg.sender][tokenId], "Must purchase note to rate");
        require(userRatings[tokenId][msg.sender] == 0, "Already rated this note");

        Note storage note = notes[tokenId];
        
        // Update rating
        userRatings[tokenId][msg.sender] = rating;
        note.totalRating += rating;
        note.ratingCount++;
        note.rating = uint8(note.totalRating / note.ratingCount);

        emit NoteRated(tokenId, msg.sender, rating);
    }

    /**
     * @dev Updates the price of a note
     * @param tokenId The ID of the note
     * @param newPrice The new price in Wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) 
        external 
        onlyAuthor(tokenId) 
        validPrice(newPrice) 
    {
        uint256 oldPrice = notes[tokenId].price;
        notes[tokenId].price = newPrice;
        
        emit PriceUpdated(tokenId, oldPrice, newPrice);
    }

    /**
     * @dev Updates the sale status of a note
     * @param tokenId The ID of the note
     * @param forSale Whether the note is for sale
     */
    function updateSaleStatus(uint256 tokenId, bool forSale) 
        external 
        onlyAuthor(tokenId) 
    {
        notes[tokenId].forSale = forSale;
        
        emit SaleStatusUpdated(tokenId, forSale);
    }

    /**
     * @dev Withdraws earnings for an author
     */
    function withdrawEarnings() external nonReentrant {
        uint256 earnings = authorEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");

        authorEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(earnings);

        emit EarningsWithdrawn(msg.sender, earnings);
    }

    /**
     * @dev Gets all notes by an author
     * @param author The author's address
     * @return Array of note IDs
     */
    function getNotesByAuthor(address author) external view returns (uint256[] memory) {
        return authorNotes[author];
    }

    /**
     * @dev Gets all notes in a subject
     * @param subject The subject name
     * @return Array of note IDs
     */
    function getNotesBySubject(string memory subject) external view returns (uint256[] memory) {
        return subjectNotes[subject];
    }

    /**
     * @dev Gets user's purchased notes
     * @param user The user's address
     * @return Array of note IDs
     */
    function getUserPurchases(address user) external view returns (uint256[] memory) {
        return userPurchases[user];
    }

    /**
     * @dev Gets the total number of notes
     * @return The current token ID counter
     */
    function getTotalNotes() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Checks if a user has purchased a specific note
     * @param user The user's address
     * @param tokenId The note's token ID
     * @return Whether the user has purchased the note
     */
    function hasUserPurchased(address user, uint256 tokenId) external view returns (bool) {
        return hasPurchased[user][tokenId];
    }

    // Admin Functions

    /**
     * @dev Updates the platform fee (only owner)
     * @param newFee The new platform fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_PLATFORM_FEE, "Fee exceeds maximum");
        uint256 oldFee = platformFee;
        platformFee = newFee;
        
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Pauses or unpauses the contract (only owner)
     * @param _paused Whether to pause the contract
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit ContractPaused(_paused);
    }

    /**
     * @dev Verifies a user (only owner)
     * @param user The user's address
     */
    function verifyUser(address user) external onlyOwner {
        userProfiles[user].verified = true;
        emit UserVerified(user);
    }

    /**
     * @dev Withdraws platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Emergency withdrawal function (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Override required functions
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        // Return IPFS hash as token URI
        return string(abi.encodePacked("ipfs://", notes[tokenId].ipfsHash));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Receive function to accept Ether
    receive() external payable {}
}
