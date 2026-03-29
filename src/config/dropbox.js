const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');

const createDropboxClient = () => {
  const token = process.env.DROPBOX_ACCESS_TOKEN;

  if (!token) {
    return null;
  }

  return new Dropbox({ accessToken: token, fetch });
};

module.exports = createDropboxClient;
