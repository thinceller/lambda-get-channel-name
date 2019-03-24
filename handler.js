'use strict';

const request = require('request');
const cheerio = require('cheerio');

module.exports.index = async (event, context, callback) => {
  try {
    const res = await scrapeChannelName(event.id);
    const result = {
      statusCode: 200,
      body: res
    };
    callback(null, result);
  } catch (e) {
    return e;
  }
};

const scrapeChannelName = id => {
  const url = `https://www.youtube.com/channel/${id}`;
  return new Promise((resolve, reject) => {
    request(url, (e, res, body) => {
      // When any error occurred
      if (e) {
        console.log('request error: ', e);
        reject({
          statusCode: 500,
          message: e
        });
      }

      // When a channel is not found
      if (res && res.statusCode === 404) {
        console.log(`404 not found \nchannel id: ${id}`);
        reject({
          statusCode: 404,
          message: 'not found'
        });
      }

      try {
        const $ = cheerio.load(body);
        const channelTitle = $('meta[name="title"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        resolve({ channelTitle, image });
      } catch (e) {
        console.log(e);
        reject({
          statusCode: 501,
          message: e
        });
      }
    })
  });
};
