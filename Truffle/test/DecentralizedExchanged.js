const zrx = artifacts.require("ZrxToken.sol");
const rep = artifacts.require("RepToken.sol");
const dai = artifacts.require("DaiToken.sol");
const bat = artifacts.require("BatToken.sol");
const dex = artifacts.require("DecExchange.sol");

contract('DecExchange', (accounts) => {
    let zrx,rep,dai,bat;

    const [ZRX,REP,DAI,BAT] = ['ZRX','REP','DAI','BAT'].map(ticker => web3.utils.fromAscii(ticker));

    const [trader1, trader2] = [accounts[1],accounts[2]];

    beforeEach(async() => {
        ([zrx,rep,dai,bat] = await Promise.all([
            zrx.new(),
            rep.new(),
            dai.new(),
            bat.new()
        ]));
        const Dex = await dex.new();
        await Promise.all([
             Dex.addTokenDTO(zrx.address,ZRX),
             Dex.addTokenDTO(rep.address,REP),
             Dex.addTokenDTO(dai.address,DAI),
             Dex.addTokenDTO(bat.address,BAT)
        ]);

        const amount = web3.utils.toWei('1000');
        const seedTokenBalance = async(token,trader) => {
            await token.faucet(trader, amount);
            await token.approved(Dex.address,amount, {from: trader})            
        };

        await Promise.all(
            [zrx,rep,dai,bat].map(token => seedTokenBalance(token,trader1))
        );

        await Promise.all(
            [zrx,rep,dai,bat].map(token => seedTokenBalance(token,trader2))
        );
    })
})