const createDropboxClient = require('../config/dropbox');

const getDropboxTemporaryLink = async (dropboxPath) => {
  const dbx = createDropboxClient();

  if (!dbx) {
    const error = new Error('Dropbox no configurado. Define DROPBOX_ACCESS_TOKEN o DROPBOX_APP_KEY, DROPBOX_APP_SECRET y DROPBOX_REFRESH_TOKEN');
    error.statusCode = 500;
    throw error;
  }

  const response = await dbx.filesGetTemporaryLink({
    path: dropboxPath,
  });

  return response.result.link;
};

module.exports = getDropboxTemporaryLink;
