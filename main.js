
var find = async (home_domain, makeProgress) => {

    const server = new StellarSdk.Server("https://horizon.stellar.org");
    var toml = await StellarSdk.StellarTomlResolver.resolve(home_domain);

    var output = [];
    var total = toml.CURRENCIES.length;
    var count = 0;
    for (var currency of toml.CURRENCIES) {
        count++;
        let asset = new StellarSdk.Asset(currency.code, currency.issuer)
        let local = {
            asset: asset.toString(),
            holders: []
        };
        let accounts = await server.accounts().forAsset(asset).limit(200).call();
        while (accounts.records.length > 0) {

            for (let holder of accounts.records) {
                for (let b of holder.balances) {
                    if (b.asset_code == asset.code && b.asset_issuer === asset.issuer) {
                        if (parseFloat(b.balance) > 0) {
                            local.holders.push({
                                id: holder.id,
                                balance: b.balance
                            })
                        }
                        break;
                    }
                }
            }

            accounts.records = await accounts.next();
        }
        output.push(local);

        makeProgress(count / total * 100);
    }

    return output;
}

