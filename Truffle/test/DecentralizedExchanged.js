const zrx = artifacts.require("ZrxToken.sol");
const rep = artifacts.require("RepToken.sol");
const dai = artifacts.require("DaiToken.sol");
const bat = artifacts.require("BatToken.sol");
const dex = artifacts.require("DecExchange.sol");

contract('DecExchange', () => {
    let zrx,rep,dai,bat;

    const [ZRX,REP,DAI,BAT] = ['ZRX','REP','DAI','BAT'].map(ticker => web3.utils.fromAscii(ticker));
    beforeEach(async() => {
        ([zrx,rep,dai,bat] = await Promise.all([
            zrx.new(),
            rep.new(),
            dai.new(),
            bat.new()
        ]));
        const Dex = await dex.new();
        await Promise.all([
             Dex.addTokenDTO(zrx.address,ZRZ),
             Dex.addTokenDTO(rep.address,REP),
             Dex.addTokenDTO(dai.address,DAI),
             Dex.addTokenDTO(bat.address,BAT)
        ]);
    })
})