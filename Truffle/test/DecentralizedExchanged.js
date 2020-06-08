const zrx = artifacts.require("ZrxToken.sol");
const rep = artifacts.require("RepToken.sol");
const dai = artifacts.require("DaiToken.sol");
const bat = artifacts.require("BatToken.sol");

contract('DecExchange', () => {
    let zrx,rep,dai,bat;

    beforeEach(async() => {
        ([zrx,rep,dai,bat] = await Promise.all([
            zrx.new(),
            rep.new(),
            dai.new(),
            bat.new()
        ]));
    })
})