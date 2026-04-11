const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');

const createDropboxClient = () => {
  const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;

  if (accessToken) {
    return new Dropbox({ accessToken, fetch });
  }

  if (appKey && appSecret && refreshToken) {
    return new Dropbox({
      clientId: appKey,
      clientSecret: appSecret,
      refreshToken,
      fetch,
    });
  }

  return null;
};

module.exports = createDropboxClient;
