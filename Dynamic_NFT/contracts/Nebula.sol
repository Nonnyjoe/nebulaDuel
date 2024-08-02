// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";


contract NebulaNFT is Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

        uint256 private _tokenIds;
        uint256 private _metadataTableId;
        address public dappAddress;
        string private _baseURIString;
        string private _tablePrefix;
        string private _metadataTable;
        mapping(uint256 => bool) public _exists;



    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner, string memory baseURI ) initializer public {
        __ERC721_init("NebulaNFT", "NFT");
        __ERC721URIStorage_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();

        _tablePrefix = "NebulaNFT";
        _baseURIString = baseURI;

    }

    /*
     * `createMetadataTable` initializes the token tables.
     */
    function createMetadataTable()
        public
        payable
        onlyOwner
        returns (uint256)
    {
        _metadataTableId = TablelandDeployments.get().create(
            address(this),
            /*
             *  CREATE TABLE prefix_chainId (
             *  text name, 
             *  text cid,
             *  int health, 
             *  int strength, 
             *  int attack, 
             *  int speed, 
             *  text superPower, 
             *  int id, 
             *  int totalWins, 
             *  int totalLoss, 
             *  int price, 
             *  text owner
             *  );
             */
            SQLHelpers.toCreateFromSchema("id int primary key, name text, owner text, image text, price int, health int, strength int, attack int, speed int, superPower text, totalWins int, totalLoss int", _tablePrefix)
        );

        _metadataTable = SQLHelpers.toNameFromId(
            _tablePrefix,
            _metadataTableId
        );

        return _metadataTableId;
    }



    /*
     * `safeMint` allows anyone to mint a token in this project.
     * Any time a token is minted, a new row of metadata will be
     * dynamically inserted into the metadata table.
     */

     //  Godzilla = new Character("Godzilla", "0xgffg", "ipfs://gvggfg", 270, 80, 8, 15, 10, "Thunderbolt", 1, 3);
    function safeMint(address to, uint256 tokenId, string memory setters)  internal returns (uint256) {
    // Insert table values upon minting.
    TablelandDeployments.get().mutate(
        address(this),
        _metadataTableId,
        SQLHelpers.toInsert(
            _tablePrefix,
            _metadataTableId,
            "id, name, owner, image, price, health, strength, attack, speed, superPower, totalWins, totalLoss",
            setters
        )
    );
        _exists[tokenId] = true;
        _safeMint(to, tokenId);
        _tokenIds++;
        return tokenId;
    }

    /**
     *  Update the metadata table with the setters
     * @param tokenId : The id of the token
     * @param setters : The setters to update the metadata table
     */

     function updateBattleround(uint256 tokenId, string memory setters) internal {
        // Only update the row with the matching `id`
        string memory filters = string.concat("id=", Strings.toString(tokenId));
        
        // Update the table
        TablelandDeployments.get().mutate(
            address(this),
            _metadataTableId,
            SQLHelpers.toUpdate(
                _tablePrefix,
                _metadataTableId,
                setters,
                filters
            )
        );
    }



     function entrypoint(address to, uint256 _tokenid, string memory _name, string memory _image, uint256 health, uint256 strength, uint256 attack, uint256 speed, string memory superPower, uint256 totalWins, uint256 totalLoss) public  {
        require(to != address(0), "Invalid address");
        require(msg.sender == dappAddress || msg.sender == owner(), "Invalid caller");
        
        if (!_exists[_tokenid]) {
            string memory setters = string.concat(
                Strings.toString(_tokenid), ",'",
                _name, "','",
                Strings.toHexString(to), "','",
                _image, "',0,",
                Strings.toString(health), ",",
                Strings.toString(strength), ",",
                Strings.toString(attack), ",",
                Strings.toString(speed), ",'",
                superPower, "',",
                Strings.toString(totalWins), ",",
                Strings.toString(totalLoss)
            );
            safeMint(to, _tokenid, setters);
        } else {
            // Construct the setters to update other attributes
            string memory setters = string.concat(
                "health=", Strings.toString(health),
                ",strength=", Strings.toString(strength),
                ",attack=", Strings.toString(attack),
                ",speed=", Strings.toString(speed),
                ",superPower='", superPower, "'",
                ",totalWins=", Strings.toString(totalWins),
                ",totalLoss=", Strings.toString(totalLoss)
            );
            updateBattleround(_tokenid, setters);
        }
    }

      /*
     * `_transfer` update the transfer function so that.
     * when called the owner is updated in the metadata table.
     * This is a simple example of how to update a row in the table
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        // Call parent _transfer function to perform the transfer
        super._update(to, tokenId, auth);

        string memory setters = string.concat("owner='", Strings.toHexString(to), "'");
        string memory filters = string.concat("id=", Strings.toString(tokenId));

        // Update owner in the SQL table
        TablelandDeployments.get().mutate(
            address(this),
            _metadataTableId,
            SQLHelpers.toUpdate(
                _tablePrefix,
                _metadataTableId,
                setters,
                filters
            )
        );
    }




    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}



     /*
     * `_baseURI` returns the base token URI.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseURIString;
    }

 

    function tokenURI(uint256 tokenId) public view virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        require(_exists[tokenId], "ERC721URIStorage: URI query for nonexistent token");

        string memory base = _baseURI();
    
            return string.concat(
                base,
                "query?unwrap=true&extract=true&statement=",
                "SELECT%20json_object%28%27name%27%2C%20name%20%7C%7C%20%27%20%23%27%20%7C%7C%20id%2C%20", // Name as name_id
                "%27image%27%2C%20image%2C%20%27attributes%27%2Cjson_array%28", // Use image field instead of externalURL
                "json_object%28%27display_type%27%2C%20%27text%27%2C%20%27trait_type%27%2C%20%27owner%27%2C%20%27value%27%2C%20owner%29%2C", // Include owner in attributes
                "json_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27id%27%2C%20%27value%27%2C%20", Strings.toString(tokenId), "%29%2C", // Include id in attributes
                "json_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27price%27%2C%20%27value%27%2C%20price%29%2C", // Include price in attributes
                "json_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27health%27%2C%20%27value%27%2C%20health%29%2C",
                "json_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27strength%27%2C%20%27value%27%2C%20strength%29%2C",
                "json_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27attack%27%2C%20%27value%27%2C%20attack%29%2C",
                "json_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27speed%27%2C%20%27value%27%2C%20speed%29%2C",
                "json_object%28%27display_type%27%2C%20%27text%27%2C%20%27trait_type%27%2C%20%27superPower%27%2C%20%27value%27%2C%20superPower%29%2C",
                "json_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27totalWins%27%2C%20%27value%27%2C%20totalWins%29%2C",
                "json_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27totalLoss%27%2C%20%27value%27%2C%20totalLoss%29",
                "%29%29%20FROM%20", _metadataTable, "%20WHERE%20id=", Strings.toString(tokenId)
            );
    }



     /*
     * `_metadataTable` returns a simple SQL "SELECT *" statement.
     */
    function metadataURI() public view returns (string memory) {
        string memory base = _baseURI();
        return
            string.concat(
                base,
                "query?statement=", // Simple read query setup
                "SELECT%20*%20FROM%20",
                _metadataTable
            );
    }

     /*
     * `setPrice` updates the price of a token by its ID.
     * @param tokenId The ID of the token
     * @param newPrice The new price to set
     */
    // function setPrice(uint256 tokenId, uint256 newPrice, address sender) public onlyOwner {
    //     require(_exists[tokenId], "ERC721: nonexistent token");
    //     require(sender == ownerOf(tokenId), "ERC721: Not Owner");

    //     string memory setters = string.concat("price=", Strings.toString(newPrice));
    //     string memory filters = string.concat("id=", Strings.toString(tokenId));

    //     // Update price in the SQL table
    //     TablelandDeployments.get().mutate(
    //         address(this),
    //         _metadataTableId,
    //         SQLHelpers.toUpdate(
    //             _tablePrefix,
    //             _metadataTableId,
    //             setters,
    //             filters
    //         )
    //     );
    // }

    function setDappAddress(address _dappAddress) public onlyOwner {
        require(_dappAddress != address(0), "Invalid address");
        dappAddress = _dappAddress;
    }

    /**
     * `totalSupply` simply returns the total number of tokens.
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }

    function onERC721Received(address, address, uint256, bytes calldata) public pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }


    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
