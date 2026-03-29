const path = require('path');
const createDropboxClient = require('../config/dropbox');

const sanitizeFileName = (fileName) => {
  return fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
};

const uploadToDropbox = async (file) => {
  const dbx = createDropboxClient();

  if (!dbx) {
    const error = new Error('DROPBOX_ACCESS_TOKEN no configurado');
    error.statusCode = 500;
    throw error;
  }

  const ext = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, ext);
  const cleanName = `${sanitizeFileName(baseName)}${ext}`;
  const dropboxPath = `/prospectos/${Date.now()}_${cleanName}`;

  const response = await dbx.filesUpload({
    path: dropboxPath,
    contents: file.buffer,
    mode: { '.tag': 'add' },
    autorename: true,
  });

  return response.result.path_display || response.result.path_lower;
};

module.exports = uploadToDropbox;
