import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import na from 'ncp';
import JSZip from 'jszip';
import { ConsoleUtil, ErrorUtil } from '../utils';
import { CallbackFunc } from '../interfaces/callback.interface';

const ncp = na.ncp;

//ncp.limit = 16;

const blacklist = ['.DS_Store', '#recycle', '@eaDir'];

export class FileUtil {
  static readDir(rootDir: string, relPath: string, callback: CallbackFunc) {
    if (!this.isPathValid(rootDir, relPath)) {
      callback(`Path ${relPath} is invalid!`, null);
      return;
    }

    const fullPath = path.join(rootDir, relPath);

    fs.readdir(fullPath, (err, files) => {
      if (err) {
        callback(err, null);
        return;
      }

      const items = files
        .filter((filename) => {
          return !blacklist.includes(filename);
        })
        .map((filename) => {
          const filePath = path.join(fullPath, filename);
          let isDir = false;
          let size = 0;
          let createdAt = null;
          let updatedAt = null;
          try {
            const stat = fs.statSync(filePath);
            isDir = stat.isDirectory();
            size = stat.size || size;
            createdAt = stat.birthtimeMs;
            updatedAt = stat.mtimeMs;
          } catch (e) {
            return null;
          }
          return {
            name: filename,
            relPath: relPath,
            isDir,
            size,
            createdAt,
            updatedAt,
          };
        })
        .filter(Boolean);

      callback(null, items);
    });
  }

  static creatDirectory(rootDir: string, relPath: string, folderName: string, callback: CallbackFunc) {
    if (!this.isPathValid(rootDir, relPath, folderName)) {
      callback(ErrorUtil.createHttpError(`New folder name ${folderName} is invalid!`), null);
      return;
    }
    const fullPath = path.join(rootDir, relPath, folderName);

    if (!fs.existsSync(fullPath)) {
      // create parent directories if they doesn't exist.
      mkdirp(fullPath)
        .then(() => {
          callback(null, `Directory ${path.basename(fullPath)} has been created!`);
        })
        .catch((err) => {
          // error handler is called
          callback(err, null);
        });
    } else {
      callback(ErrorUtil.createHttpError(`Folder ${path.basename(fullPath)} already exists!`), null);
    }
  }

  static getDownloadPath(rootDir: string, relPath: string, callback: CallbackFunc) {
    if (!this.isPathValid(rootDir, relPath)) {
      callback(ErrorUtil.createHttpError(`Path ${relPath} is invalid!`), null);
      return;
    }

    const filePath = path.join(rootDir, relPath);
    callback(null, filePath);
  }

  static renameFileOrDir(rootDir: string, oldPath: string, newPath: string, callback: CallbackFunc) {
    if (!this.isPathValid(rootDir, oldPath)) {
      callback(ErrorUtil.createHttpError(`Old path ${oldPath} is invalid!`), null);
      return;
    }
    if (!this.isPathValid(rootDir, newPath)) {
      callback(ErrorUtil.createHttpError(`New path ${newPath} is invalid!`), null);
      return;
    }

    const from = path.join(rootDir, oldPath);
    const to = path.join(rootDir, newPath);

    fs.rename(from, to, (err: any) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, `Renaming from ${from} to ${to}`);
    });
  }

  static createArchive(
    rootDir: string,
    relPath: string,
    fileNames: string[],
    archivedFileName: string,
    embedDirs: boolean,
    callback: CallbackFunc,
  ) {
    const fullPath = path.join(rootDir, relPath);

    if (!this.isPathValid(fullPath, archivedFileName)) {
      callback(ErrorUtil.createHttpError(`Path ${relPath} or file name ${archivedFileName} is invalid!`), null);
      return;
    }

    const zip = new JSZip();

    function addFile(fileName: string) {
      const data = fs.readFileSync(path.join(fullPath, fileName));
      let name;
      if (embedDirs) {
        name = fileName;
      } else {
        name = path.basename(fileName);
      }
      zip.file(name, data);
    }

    function addDir(dir: string) {
      const files = fs.readdirSync(path.join(fullPath, dir));
      for (const file of files) {
        process(path.join(dir, file));
      }
    }

    function process(filePath: string) {
      const stat = fs.statSync(path.join(fullPath, filePath));
      if (stat.isDirectory()) {
        addDir(filePath);
      } else {
        addFile(filePath);
      }
    }

    // Add each src.  For directories, do the entire recursive dir.
    for (const fileName of fileNames) {
      if (!this.isPathValid(fullPath, fileName)) {
        callback(ErrorUtil.createHttpError(`File ${fileName} is invalid!`), null);
        return;
      }

      process(fileName);
    }

    // Generate the zip and store the final.
    zip
      .generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
      .then((content) => {
        //fs.writeFileSync(fullPath, content, 'binary');

        fs.writeFile(path.join(fullPath, archivedFileName), content, 'binary', (err) => {
          if (err) {
            callback(err, null);
            return;
          }

          callback('', `File is archived!`);
        });
      })
      .catch((err) => {
        // error handler is called
        callback(err, null);
      });
  }

  static deleteFile(rootDir: string, relPath: string, fileName: string, callback: CallbackFunc) {
    if (!this.isPathValid(rootDir, relPath, fileName)) {
      callback(ErrorUtil.createHttpError(`Path ${relPath} or file name ${fileName} is invalid!`), null);
      return;
    }

    const fullPath = path.join(rootDir, relPath, fileName);

    fs.unlink(fullPath, (err) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, '');
    });
  }

  static saveFile(file: string, content: string, callback: CallbackFunc) {
    // create parent directories if they doesn't exist.
    mkdirp(file)
      .then(() => {
        return fs.writeFile(file, content, (err) => {
          if (err) {
            callback(err, null);
            return;
          }

          callback(null, `file is saved!`);
        });
      })
      .catch((error) => {
        // error handler is called
        ConsoleUtil.log(error);
        callback(error, null);
      });
  }

  static copyFile(source: string, target: string, callback: CallbackFunc) {
    let isCalled = false;

    const rd = fs.createReadStream(source);
    rd.on('error', (err) => {
      done(err);
    });
    const wr = fs.createWriteStream(target);
    wr.on('error', (err) => {
      done(err);
    });
    wr.on('close', function (ex: any) {
      done(ex);
    });
    rd.pipe(wr);

    function done(err: any) {
      if (!isCalled) {
        callback(err, null);
        isCalled = true;
      }
    }
  }

  static copyDirectory(source: string, target: string, callback: CallbackFunc) {
    // create parent directories if they doesn't exist.
    mkdirp(target)
      .then(() => {
        ncp(source, target, (err) => {
          if (err) {
            callback(err, null);
            return;
          }
          callback(null, '');
        });
      })
      .catch((err) => {
        // error handler is called
        ConsoleUtil.log(err);
        callback(err, null);
      });
  }

  static readFile(file: string, callback: CallbackFunc) {
    fs.readFile(file, (err, data) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, data);
    });
  }

  // security check for the absolute file path
  static isPathValid(rootDir: string, relPath: string, filename?: string) {
    let fullpath = path.join(rootDir, relPath);
    if (filename) {
      fullpath = path.join(fullpath, filename);
    }

    // make sure the path is always in the rootDir
    return fullpath.startsWith(rootDir);
  }

  static validatePath(rootDir: string, relPath: string,) {
    if (!this.isPathValid(rootDir, relPath)) {
      return ErrorUtil.createHttpError(`Path ${relPath} is invalid!`);
    }

    return null;
  }

  static getPath(path1: string, path2: string): string {
    return path.join(path1, path2);
  }
}
