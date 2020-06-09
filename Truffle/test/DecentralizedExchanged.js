const { expectRevert } = require("@openzeppelin/test-helpers");
const Zrx = artifacts.require("ZrxToken.sol");
const Rep = artifacts.require("RepToken.sol");
const Dai = artifacts.require("DaiToken.sol");
const Bat = artifacts.require("BatToken.sol");
const Dex = artifacts.require("DecExchange.sol");

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
    

})