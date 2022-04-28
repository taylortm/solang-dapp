contract Contract {

    mapping (address => uint256) private myTotal;
    
    constructor() {

    }
    
    function buy() public payable returns(uint256) {
        uint256 amount = 1;
        // you will get 1 of myTotal every time you call this regardless of sol amount transferred.
        myTotal[msg.sender] = myTotal[msg.sender] + amount;
        return 1;
    }

    function getMyTotal() public view returns(uint256) {
        return myTotal[msg.sender];
    }

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }
}