const { expectRevert } = require("@openzeppelin/test-helpers");
const Zrx = artifacts.require("ZrxToken.sol");
const Rep = artifacts.require("RepToken.sol");
const Dai = artifacts.require("DaiToken.sol");
const Bat = artifacts.require("BatToken.sol");
const Dex = artifacts.require("DecExchange.sol");

const STATUS = {
    BUY: 0,
    SELL: 1
};

contract('DecExchange', (accounts) => {
    let zrx,rep,dai,bat,dex;

    const [ZRX,REP,DAI,BAT] = ['ZRX','REP','DAI','BAT'].map(ticker => web3.utils.fromAscii(ticker));

    const [trader1, trader2] = [accounts[1],accounts[2]];

    beforeEach(async() => {
        ([zrx,rep,dai,bat] = await Promise.all([
            Zrx.new(),
            Rep.new(),
            Dai.new(),
            Bat.new()
        ]));
        dex = await Dex.new();
        await Promise.all([
             dex.addTokenDTO(zrx.address,ZRX),
             dex.addTokenDTO(rep.address,REP),
             dex.addTokenDTO(dai.address,DAI),
             dex.addTokenDTO(bat.address,BAT)
        ]);

        const amount = web3.utils.toWei('1000');
        const seedTokenBalance = async(token,trader) => {
            await token.faucet(trader, amount);
            await token.approve(dex.address,amount, {from: trader})            
        };

        await Promise.all(
            [zrx,rep,dai,bat].map(token => seedTokenBalance(token,trader1))
        );

        await Promise.all(
            [zrx,rep,dai,bat].map(token => seedTokenBalance(token,trader2))
        );
    });
    
    it('should deposit tokens', async () => {
        const amount = web3.utils.toWei('100');
    
        await dex.depositTokenDTO(
          amount,
          DAI,
          {from: trader1}
        );
    
        const balance = await dex.tradeBalanceMap(trader1, DAI);
        assert(balance.toString() === amount);
      });
    
    it('should Not deposit if token is invalid', async () => {
        await expectRevert(dex.depositTokenDTO(
            web3.utils.toWei('100'),
            web3.utils.fromAscii('INVALID-TOKEN'),
            {from: trader1}
          ),'not a valid token')
        
      });
    
    it("should withdraw tokens", async() => {
        const amount = web3.utils.toWei('100');
        await dex.depositTokenDTO(amount,DAI, {from: trader1});

        await dex.withdrawTokenDTO(amount,DAI, {from: trader1});

        const [balanceDex, balanceDai] = await Promise.all([
            dex.tradeBalanceMap(trader1,DAI),
            dai.balanceOf(trader1)
           ]
        );

        assert(balanceDex.isZero());
        assert(balanceDai.toString() === web3.utils.toWei('1000'));

    });

    it('should Not withdraw if token is invalid', async () => {
        await expectRevert(dex.withdrawTokenDTO(
            web3.utils.toWei('100'),
            web3.utils.fromAscii('INVALID-TOKEN'),
            {from: trader1}
          ),'not a valid token')
        
    });

    it("should not withdraw tokens if balance is too low", async() => {
        const amount = web3.utils.toWei('100');
        await dex.depositTokenDTO(amount,DAI, {from: trader1});

        await expectRevert(
            dex.withdrawTokenDTO(
                web3.utils.toWei('1000'),
                DAI, 
                {from: trader1}),
            "Balance is too low"
        )
    });

    it("should allow to add limit order", async() => {
        const amount = web3.utils.toWei('100');
        await dex.depositTokenDTO(amount,DAI, {from: trader1});

        await dex.addLimitOrderDTO(
            REP,
            web3.utils.toWei('10'),
            10,
            STATUS.BUY,
            {from: trader1}
        );

        const buyorders = await dex.getOrdersDTO(REP,STATUS.BUY);
        const sellorders = await dex.getOrdersDTO(REP,STATUS.SELL);
        assert(buyorders.length === 1);
        assert(sellorders.length === 0);
        assert(buyorders[0].trader === trader1);
        assert(buyorders[0].tokenTickerName === web3.utils.padRight(REP,64));
        assert(buyorders[0].amount === web3.utils.toWei('10'));
        assert(buyorders[0].price === '10');

    });
})