import Time from '../helpers/time'
import BinanceNode from 'binance-api-node'

export default class Binance {

  constructor (key, secret) {
    this.instance = BinanceNode({
      apiKey: key,
      apiSecret: secret,
    })

    this.cache = {}
  }

  setStore (store) {
    this.store = store
  }

  async pairs (watchingPairs) {
    if (this.cache[Time.getCurrentTimestamp()]) {
      return this.cache[Time.getCurrentTimestamp()]
    }

    let pairs = await this.instance.prices()
    console.info(`Price of BNB: ${pairs.BNBUSDT}`);
    console.info(`Price of DEXE: ${pairs.DEXEBUSD}`);
    let result = {}

    watchingPairs.forEach(key => {
      //if (key.slice(-3) === 'BTC') {
        result[key] = pairs[key];
        console.log(key + " --- price: "  + result[key]);
      //}
    })

    /*this.instance.prices('DEXEBUSD', (error, ticker) => {
      console.info("Price of DEXE: ", ticker.DEXEBUSD);
    });*/

    this.cache[Time.getCurrentTimestamp()] = result

    return Object.keys(result)
  }


  async runListener (pairs) {
    let self = this

    return await this.instance.ws.candles(pairs, '1m', symbol => {
      this.store.log({
        'pair': symbol.symbol,
        'value': symbol.close,
        'timestamp': Time.getCurrentTimestamp()
      })
    });
  }

}
