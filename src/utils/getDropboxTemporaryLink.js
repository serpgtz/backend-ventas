const createDropboxClient = require('../config/dropbox');

const getDropboxTemporaryLink = async (dropboxPath) => {
  const dbx = createDropboxClient();

  if (!dbx) {
    const error = new Error('DROPBOX_ACCESS_TOKEN no configurado');
    error.statusCode = 500;
    throw error;
  }

  const response = await dbx.filesGetTemporaryLink({
    path: dropboxPath,
  });

  return response.result.link;
};

module.exports = getDropboxTemporaryLink;
