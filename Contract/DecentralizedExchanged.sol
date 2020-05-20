pragma solidity ^0.6.3;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

contract DecExchange {
 
    //define the Token   to be use in the contract
    struct TokenDTO {
        address tokenAddress;
        bytes32 tokenTickerName;
    }
    
    //create a mapping list holding the struct Token
    mapping(bytes32 => TokenDTO) public tokenMap;
    bytes32[] public tokenArray;
    
    //mapping of trade balance
    mapping(address => mapping(bytes32 => uint)) public tradeBalanceMap;
    
    //admin address
    address public admin;
    
    constructor() public {
        admin = msg.sender;
    }
    
    function depositTokenDTO(uint _amount, bytes32 _tokenTickerName) external validTokenName(_tokenTickerName) {
        IERC20(tokenMap[_tokenTickerName].tokenAddress).transferFrom(msg.sender, address(this), _amount);
        tradeBalanceMap[msg.sender][_tokenTickerName] += _amount;
        
    }
    
    function withdrawTokenDTO(uint _amount, bytes32 _tokenTickerName) external validTokenName(_tokenTickerName){
        tradeBalanceMap[msg.sender][_tokenTickerName] -= _amount;
        IERC20(tokenMap[_tokenTickerName].tokenAddress).transfer(msg.sender,  _amount);
    }
    
    function addTokenDTO(address _tokenAddress, bytes32 _tokenTickerName) external onlyAdmin() {
        //insert to mapping
        tokenMap[_tokenTickerName] = TokenDTO(_tokenAddress, _tokenTickerName);
        //push to tokenArray the tokentickerName
        tokenArray.push(_tokenTickerName);
    }
    
    
    
    //modifiers
    modifier onlyAdmin() {
        require(admin == msg.sender,"Only Administrator can use this feature");
        _;
    }
    
    modifier validTokenName(bytes32 _tokenTickerName) {
        require(tokenMap[_tokenTickerName].tokenAddress != address(0), "not a valid token");
        _;
    }
}