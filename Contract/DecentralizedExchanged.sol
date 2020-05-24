pragma solidity ^0.6.3;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

contract DecExchange {
 
    enum StatusType {
        BUY,
        SELL
    }
   
   //STRUCT SECTIONS 
    struct OrderDTO {
        uint id;
        StatusType statusType;
        bytes32 tokenTickerName;
        uint amount;
        uint filled;
        uint price;
        uint date;
    }
    //define the Token   to be use in the contract
    struct TokenDTO {
        address tokenAddress;
        bytes32 tokenTickerName;
    }
    
    //MAPPING SECTION
    //create a mapping list holding the struct Token
    mapping(bytes32 => TokenDTO) public tokenMap;
     //create a mapping of trade balance
    mapping(address => mapping(bytes32 => uint)) public tradeBalanceMap;
    //crate a mapping for Trading Orders
    mapping(bytes32 => mapping(uint => OrderDTO[])) public tradingOrderBookMap; //need to be sorted based on order type
   
   
    //VARIABLES SECTIONS
    bytes32[] public tokenArray;
    //admin address
    address public admin;
    // counter for the next order id
    uint nextOrderId;
    //const for DAI token
    bytes32 constant DAI = bytes32('DAI');
    //counter for the next trade id
    uint nextTradeId;
    
    //events
    event NewTrade(
      uint tradeId,
      uint orderId,
      bytes32 indexed tokentickerName,
      address indexed firstTrader,
      address indexed  secondtrader,
      uint amount,
      uint price,
      uint date
    );
    
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
    
    function addLimitOrderDTO(bytes32 _tokenTickerName,
                              uint _amount,
                              uint _price,
                              StatusType _statusType) external validTokenName(_tokenTickerName) {
        
        //should not transact with DAI based tokenMap
        require(_tokenTickerName != DAI, "DAI cant be traded");
        if(_statusType == StatusType.SELL) {
            require(tradeBalanceMap[msg.sender][_tokenTickerName] >= _amount,"Balance is too low");
        }
        else {
            require(tradeBalanceMap[msg.sender][DAI] >= (_amount * _price),"DAI Balance is too low");
        }
        
        OrderDTO[] storage orders = tradingOrderBookMap[_tokenTickerName][uint(_statusType)];
        orders.push(OrderDTO(
            nextOrderId,
            _statusType,
            _tokenTickerName,
            _amount,
            0,
            _price,
            now
        ));
        
        //todo: add sorting
        uint len = orders.length-1;
        while(len > 0) {
            if(_statusType == StatusType.SELL && orders[len - 1].price > orders[len].price) break;
            if(_statusType == StatusType.BUY && orders[len - 1].price < orders[len].price) break;
            OrderDTO memory order = orders[len - 1];
            orders[len - 1] = orders[len];
            orders[len] = order;
            len--;
        }
        nextOrderId++;
    }
    
    //modifiers
    modifier onlyAdmin() {
        require(admin == msg.sender , "Only Administrator can use this feature");
        _;
    }
    
    modifier validTokenName(bytes32 _tokenTickerName) {
        require(tokenMap[_tokenTickerName].tokenAddress != address(0), "not a valid token");
        _;
    }
}