
var find = async (home_domain) => {

    const server = new StellarSdk.Server("https://horizon.stellar.org");
    var toml = await StellarSdk.StellarTomlResolver.resolve(home_domain);

    var output = [];
    for (var currency of toml.CURRENCIES) {
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
    }

    return output;
}

