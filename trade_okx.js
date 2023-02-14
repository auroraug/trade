const CryptoJS = require ('crypto-js');
const axios = require('axios');

const apiKey = 'Your_API_Key';//API Key
const apiSecret = 'Your_API_Secret';//API密钥 例如22582BD0CFF14C41EDBF1AB98506286D
const passphrase = 'Your_Passphrase';  //设置API的密码
const symbol = 'ETH-USDT';//交易对
const buy_sell = 'buy'; //buy买入，sell卖出
const price = '1500'; // null 表示市价单，或输入限价价格string类型
const amount = '0.1';  //市价买入则amount代表USDT量，限价amount代表币数量，如这里1500USDT下单0.1个ETH

const method = 'POST';
const request = 'trade/order';//输入请求接口路径，如/api/v5/account/balance  trade/cancel-order撤单
const path = `api/v5/${request}`;

const body = {//下单
  instId: symbol,
  tdMode: 'cash', // cash 表示现货
  side: buy_sell,
  ordType: price ? 'limit' : 'market',
  px: price,
  sz: amount,
};

const body1 = {//撤单
    instId: symbol,
    ordId: 'Your_OrderID',//订单Id，下单成功后会在控制台打印出来，例如545722804348760064
};

// 输出符合 OKEx API 要求的时间戳
// 获取当前时间的时间戳
const tm = new Date().getTime();

// 将时间戳转换为ISO 8601格式，并将其转换为UTC时间
const iso8601 = new Date(tm).toISOString();

// 将UTC时间的毫秒数去掉，以符合okx API要求的格式
const timestamp = iso8601.slice(0, -5) + 'Z';

//签名
const signaturePayload = `${timestamp}${method}/${path}${JSON.stringify(body)}`;
const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(signaturePayload,apiSecret))

//定义请求头
const headers = {
  'OK-ACCESS-KEY': apiKey,
  'OK-ACCESS-SIGN': signature,
  'OK-ACCESS-TIMESTAMP': timestamp,
  'OK-ACCESS-PASSPHRASE': passphrase,
  'Content-Type': 'application/json',
};

axios.post(`https://www.okx.com/${path}`, body, { headers })
  .then(response => {
    if (response.data.code === '0') {
        if(price){
            console.log(`下单成功，限价${price} 买入 ${amount} 的 ${symbol.split('-')[0]} ...\n订单信息：${JSON.stringify(response.data.data)}`);
        }else{
            var num = amount/price
            console.log(`交易成功，市价买入 ${num} 个 ${symbol.split('-')[0]} ...\n订单信息：${JSON.stringify(response.data.data)}`);
        }
    } else {
      console.log(`买入失败：${JSON.stringify(response.data)}`);
    }
  })
  .catch(error => {
    console.log(`买入请求出错：${error.message}`);
    console.log(error.code)
    console.log(error)
  });
