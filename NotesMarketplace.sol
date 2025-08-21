// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NotesMarketplace - Global Decentralized Study Notes Marketplace
 * @dev Optimized for hackathon deployment on Sepolia testnet
 * @author HackBuild Team
 * 
 * Features:
 * - NFT-based study notes trading
 * - IPFS file storage integration
 * - Rating and review system
 * - Author royalties and platform fees
 * - Global accessibility on Sepolia testnet
 */
contract NotesMarketplace is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    uint256 private _nextTokenId = 1;
    uint256 public constant PLATFORM_FEE_BASIS_POINTS = 250; // 2.5% platform fee
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% maximum
    
    struct Note {
        uint256 id;
        string title;
        string description;
        string ipfsHash;
        address payable author;
        uint256 price;
        bool forSale;
        uint256 createdAt;
        string subject;
        uint8 averageRating;
        uint256 ratingCount;
        uint256 downloadCount;
        bytes32 contentHash; // For plagiarism detection
    }
    
    // ============ MAPPINGS ============
    
    mapping(uint256 => Note) public notes;
    mapping(address => uint256[]) public authorNotes;
    mapping(string => uint256[]) public subjectNotes;
    mapping(address => mapping(uint256 => bool)) public hasPurchased;
    mapping(address => mapping(uint256 => bool)) public hasRated;
    mapping(address => mapping(uint256 => uint8)) public userRatings;
    mapping(address => uint256) public authorEarnings;
    mapping(bytes32 => bool) public contentHashExists; // Plagiarism prevention
    
    // ============ EVENTS ============
    
    event NoteCreated(
        uint256 indexed tokenId,
        address indexed author,
        string title,
        string subject,
        uint256 price,
        string ipfsHash,
        uint256 timestamp
    );
    
    event NotePurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    
    event NoteRated(
        uint256 indexed tokenId,
        address indexed rater,
        uint8 rating,
        uint8 newAverageRating,
        uint256 timestamp
    );
    
    event EarningsWithdrawn(
        address indexed author,
        uint256 amount,
        uint256 timestamp
    );
    
    event PriceUpdated(
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor() ERC721("StudyNotesNFT", "NOTES") Ownable(msg.sender) {
        // Initialize with owner as the deployer
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Check if a token exists
     */
    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Creates a new study note NFT
     * @param title The title of the note
     * @param description Description of the note content
     * @param ipfsHash IPFS hash of the uploaded file
     * @param price Price in wei for the note
     * @param subject Academic subject category
     * @param metadataURI Metadata URI for the NFT
     * @param contentHash Hash of the content for plagiarism detection
     * @return tokenId The ID of the created note
     */
    function createNote(
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 price,
        string memory subject,
        string memory metadataURI,
        bytes32 contentHash
    ) external returns (uint256) {
        // Input validation
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title length");
        require(bytes(description).length > 0 && bytes(description).length <= 1000, "Invalid description length");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(price > 0 && price <= 100 ether, "Invalid price range");
        require(bytes(subject).length > 0 && bytes(subject).length <= 50, "Invalid subject length");
        require(!contentHashExists[contentHash], "Content already exists - potential plagiarism");
        
        uint256 tokenId = _nextTokenId++;
        
        // Mint NFT to author
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Create note struct
        notes[tokenId] = Note({
            id: tokenId,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            author: payable(msg.sender),
            price: price,
            forSale: true,
            createdAt: block.timestamp,
            subject: subject,
            averageRating: 0,
            ratingCount: 0,
            downloadCount: 0,
            contentHash: contentHash
        });
        
        // Update mappings
        authorNotes[msg.sender].push(tokenId);
        subjectNotes[subject].push(tokenId);
        contentHashExists[contentHash] = true;
        
        emit NoteCreated(tokenId, msg.sender, title, subject, price, ipfsHash, block.timestamp);
        return tokenId;
    }
    
    /**
     * @dev Purchases a note NFT
     * @param tokenId The ID of the note to purchase
     */
    function purchaseNote(uint256 tokenId) external payable nonReentrant {
        require(_tokenExists(tokenId), "Note does not exist");
        
        Note storage note = notes[tokenId];
        
        require(note.forSale, "Note is not for sale");
        require(msg.value >= note.price, "Insufficient payment");
        require(msg.sender != note.author, "Cannot buy your own note");
        require(!hasPurchased[msg.sender][tokenId], "Already purchased this note");
        
        uint256 platformFee = (note.price * PLATFORM_FEE_BASIS_POINTS) / 10000;
        uint256 authorPayment = note.price - platformFee;
        
        // Update state
        hasPurchased[msg.sender][tokenId] = true;
        note.downloadCount++;
        authorEarnings[note.author] += authorPayment;
        
        // Refund excess payment
        if (msg.value > note.price) {
            payable(msg.sender).transfer(msg.value - note.price);
        }
        
        emit NotePurchased(tokenId, msg.sender, note.author, note.price, block.timestamp);
    }
    
    /**
     * @dev Rates a purchased note
     * @param tokenId The ID of the note to rate
     * @param rating Rating from 1 to 5
     */
    function rateNote(uint256 tokenId, uint8 rating) external {
        require(_tokenExists(tokenId), "Note does not exist");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(hasPurchased[msg.sender][tokenId] || msg.sender == owner(), "Must purchase note to rate");
        require(!hasRated[tokenId][msg.sender], "Already rated this note");
        require(msg.sender != notes[tokenId].author, "Cannot rate your own note");
        
        Note storage note = notes[tokenId];
        
        // Update rating mappings
        hasRated[tokenId][msg.sender] = true;
        userRatings[tokenId][msg.sender] = rating;
        
        // Calculate new average rating
        uint256 totalRating = (uint256(note.averageRating) * note.ratingCount) + rating;
        note.ratingCount++;
        note.averageRating = uint8(totalRating / note.ratingCount);
        
        emit NoteRated(tokenId, msg.sender, rating, note.averageRating, block.timestamp);
    }
    
    /**
     * @dev Allows authors to withdraw their earnings
     */
    function withdrawEarnings() external nonReentrant {
        uint256 earnings = authorEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        
        authorEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(earnings);
        
        emit EarningsWithdrawn(msg.sender, earnings, block.timestamp);
    }
    
    /**
     * @dev Updates the price of a note (only by author)
     * @param tokenId The ID of the note
     * @param newPrice New price in wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        require(_tokenExists(tokenId), "Note does not exist");
        require(notes[tokenId].author == msg.sender, "Only author can update price");
        require(newPrice > 0 && newPrice <= 100 ether, "Invalid price range");
        
        uint256 oldPrice = notes[tokenId].price;
        notes[tokenId].price = newPrice;
        
        emit PriceUpdated(tokenId, oldPrice, newPrice, block.timestamp);
    }
    
    /**
     * @dev Toggles sale status of a note (only by author)
     * @param tokenId The ID of the note
     */
    function toggleSaleStatus(uint256 tokenId) external {
        require(_tokenExists(tokenId), "Note does not exist");
        require(notes[tokenId].author == msg.sender, "Only author can toggle sale");
        
        notes[tokenId].forSale = !notes[tokenId].forSale;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets all notes (for marketplace display)
     * @return Array of all notes
     */
    function getAllNotes() external view returns (Note[] memory) {
        uint256 totalNotes = _nextTokenId - 1;
        Note[] memory allNotes = new Note[](totalNotes);
        
        for (uint256 i = 1; i <= totalNotes; i++) {
            if (_tokenExists(i)) {
                allNotes[i - 1] = notes[i];
            }
        }
        
        return allNotes;
    }
    
    /**
     * @dev Gets notes by author
     * @param author Address of the author
     * @return Array of note IDs by the author
     */
    function getNotesByAuthor(address author) external view returns (uint256[] memory) {
        return authorNotes[author];
    }
    
    /**
     * @dev Gets notes by subject
     * @param subject Subject category
     * @return Array of note IDs in the subject
     */
    function getNotesBySubject(string memory subject) external view returns (uint256[] memory) {
        return subjectNotes[subject];
    }
    
    /**
     * @dev Gets detailed note information
     * @param tokenId The ID of the note
     * @return Note struct with all details
     */
    function getNoteDetails(uint256 tokenId) external view returns (Note memory) {
        require(_tokenExists(tokenId), "Note does not exist");
        return notes[tokenId];
    }
    
    /**
     * @dev Checks if user has purchased a specific note
     * @param user Address of the user
     * @param tokenId The ID of the note
     * @return Boolean indicating purchase status
     */
    function hasUserPurchased(address user, uint256 tokenId) external view returns (bool) {
        return hasPurchased[user][tokenId];
    }
    
    /**
     * @dev Gets total number of notes
     * @return Total count of created notes
     */
    function getTotalNotes() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Gets user's rating for a specific note
     * @param user Address of the user
     * @param tokenId The ID of the note
     * @return User's rating (0 if not rated)
     */
    function getUserRating(address user, uint256 tokenId) external view returns (uint8) {
        return userRatings[tokenId][user];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Withdraws platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency function to pause/unpause note creation
     * @param tokenId Note to remove (emergency only)
     */
    function emergencyRemoveNote(uint256 tokenId) external onlyOwner {
        require(_tokenExists(tokenId), "Note does not exist");
        
        // Mark as not for sale
        notes[tokenId].forSale = false;
        
        // Remove content hash to allow re-upload
        contentHashExists[notes[tokenId].contentHash] = false;
    }
    
    // ============ REQUIRED OVERRIDES ============
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Generates content hash for plagiarism detection
     * @param content The content to hash
     * @return bytes32 hash of the content
     */
    function generateContentHash(string memory content) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(content));
    }
    
    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        // Allow contract to receive ETH for platform fees
    }
}

/*
 * DEPLOYMENT INFORMATION:
 * ========================
 * 
 * Network: Sepolia Testnet
 * Compiler: Solidity ^0.8.20
 * Optimization: Enabled (200 runs)
 * 
 * Estimated Gas Cost: ~2.5M gas
 * Estimated Deployment Cost: 0.02-0.04 ETH on Sepolia
 * 
 * Features Included:
 * - NFT-based note trading
 * - IPFS integration
 * - Rating system
 * - Plagiarism detection
 * - Author royalties
 * - Platform fees
 * - Emergency controls
 * 
 * Global Accessibility:
 * - Deployed on Sepolia testnet
 * - Anyone can interact with free testnet ETH
 * - Perfect for hackathon demonstrations
 * - Verifiable on Etherscan
 * 
 * Security Features:
 * - ReentrancyGuard protection
 * - Input validation
 * - Access controls
 * - Overflow protection
 * - Emergency functions
 */
