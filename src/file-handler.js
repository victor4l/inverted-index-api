import fs from 'fs';

/**
 * @return {String} The content of the read file.
 * @param {String} filePath The path to the file to be read.
 */


export default {
  getContent(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      // fs.unlink(filePath);  // Delete  file after reading to save space
      const errorObject = {};
      // Check for empty file
      if (data.length === 0) {
        errorObject.msg = { error: 'empty file' };
        return callback(errorObject, null);
      }
      // Check for malformed file
      try {
        JSON.parse(data);
      } catch (except) {
        errorObject.msg = { error: 'invalid json in file content' };
        return callback(errorObject, null);
      }
      // Check for incorrect document structure
      const parsed = JSON.parse(data);
      if (parsed instanceof Array) {
        let valid = true;
        parsed.forEach((book) => {
          const hasTwoFields = Object.keys(book).length === 2;
          const hasTitleField = Object.prototype.hasOwnProperty.call(book, 'title');
          const hasTextField = Object.prototype.hasOwnProperty.call(book, 'text');
          if (!hasTwoFields || !hasTitleField || !hasTextField) {
            errorObject.msg = { error: 'no title or text field in one or more books' };
            valid = false;
          }
        });
        if (!valid) {
          return callback(errorObject, null);
        }
      } else {
        const hasTwoFields = Object.keys(parsed).length === 2;
        const hasTitleField = Object.prototype.hasOwnProperty.call(parsed, 'title');
        const hasTextField = Object.prototype.hasOwnProperty.call(parsed, 'text');
        if (!hasTwoFields || !hasTitleField || !hasTextField) {
          errorObject.msg = { error: 'no title or text field in book' };
          return callback(errorObject, null);
        }
      }

      return callback(null, parsed);
    });
  }
};
