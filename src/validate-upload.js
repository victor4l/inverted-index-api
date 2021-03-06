import async from 'async';
import fileHandler from './file-handler';
import invertedIndex from './inverted-index';


export default {
  /**
   * This method validates the content of the request object
   * @param {Object} req the http request object
   * @param {Function} callback a callback that passes the validity
   * @return {undefined} returns nothing
   */
  validateUpload(req, callback) {
    const indices = {};
    const files = req.files;
    // Check that files were uploaded
    if (files === undefined || files.length === 0) {
      return callback(false, { error: 'no file uploaded' });
    }
    // Keep count of number of indexed files
    let count = 0;
    files.forEach((file) => {
      const originalFileName = file.originalname;
      const filePath = file.path;
      // Check for valid file type
      const fileExtension = (originalFileName.split('.').pop()).toUpperCase();
      if (fileExtension !== 'JSON') {
        count += 1;
        indices[originalFileName] = { error: 'invalid file type' };
        // Check to see if this is the last file
        if (count === files.length) {
          return callback(true, indices);
        }
        return;
      }
      // Read file from temporary storage
      fileHandler.getContent(filePath, (err, content) => {
        if (err) {
          count += 1;
          indices[originalFileName] = err.msg;
          // Check to see if this is the last file
          if (count === files.length) {
            return callback(true, indices);
          }
          return; // Continue looping through books
        }
        let index = {};
        count += 1;
        async.series([
          (asyncCallBack) => {
            index = invertedIndex.createIndex(originalFileName, content);
            asyncCallBack(null);
          },
          () => {
            indices[originalFileName] = index;
            // Add to global index
            invertedIndex.index[originalFileName] = index;
            // Check to see if last file is indexed
            if (count === files.length) {
              return callback(true, indices);
            }
          }
        ]);
      });
    });
  }
};
