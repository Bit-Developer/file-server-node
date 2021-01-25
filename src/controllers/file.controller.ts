import { Request, Response, RequestHandler, NextFunction } from 'express';
import multer from 'multer';

import config from '../config/env.config';

import { SleepUtil, FileUtil, MessageUtil } from '../utils';

import {
  FileItem,
  CreateFolder,
  UploadFolder,
  RenameFile,
  MoveFile,
  ArchiveFile,
  DeleteFile,
} from '../interfaces/file.interfaces';

// get file list
export const file_list: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  SleepUtil.sleep();

  const { relPath } = req.query;

  FileUtil.readDir(config.rootDir, decodeURIComponent(String(relPath) || '.'), (err: any, data: FileItem[]) => {
    if (err) {
      return next(err);
    }
    res.status(200).send(data);
  });
};

// create folder
export const create_folder: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  SleepUtil.sleep();

  const bodyObj = req.body as CreateFolder;

  FileUtil.creatDirectory(config.rootDir, bodyObj.relPath, bodyObj.folderName, (err: any, message: string) => {
    if (err) {
      return next(err);
    }
    res.status(200).send(MessageUtil.success(message, null));
  });
};

// download file
export const download_file: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  SleepUtil.sleep();

  const { relPath } = req.query;

  FileUtil.getDownloadPath(config.rootDir, decodeURIComponent(String(relPath) || '.'), (err: any, filepath: string) => {
    if (err) {
      return next(err);
    }
    res.download(filepath);
  });
};

// upload file
export const upload_file: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  SleepUtil.sleep();

  const storage = multer.diskStorage({
    //multers disk storage settings
    destination: function (req, file, cb) {
      // to get the paramter other than the file from req.body, must put the path before the file.
      // formData.append("relPath", this.curFolderPath + encodeURI(this.fileToUpload.name));
      // formData.append("fileItem", this.fileToUpload, this.fileToUpload.name); // file
      const bodyObj = req.body as UploadFolder;
      const errorObj = FileUtil.validatePath(config.rootDir, bodyObj.relPath);
      if (errorObj) {
        cb(errorObj, '');
      }
      const filepath = FileUtil.getPath(config.rootDir, bodyObj.relPath);
      cb(null, filepath);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  const upload = multer({
    //multer settings
    storage: storage,
  }).single('fileItem');

  upload(req, res, (err: any) => {
    if (err) {
      return next(err);
    }
    res.status(200).send(MessageUtil.success('file is uploaded', null));
  });
};

// rename file or directory
export const rename: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  SleepUtil.sleep();

  const bodyObj = req.body as RenameFile;

  FileUtil.renameFileOrDir(config.rootDir, bodyObj.oldPath, bodyObj.newPath, (err: any) => {
    if (err) {
      return next(err);
    }
    res.status(200).send(MessageUtil.success('file is renamed', null));
  });
};

// move files and directories
export const move: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  SleepUtil.sleep();
  const moveFile = req.body as MoveFile;

  const promises = moveFile.fileNames.map((filename) => {
    return new Promise((resolve, reject) => {
      const oldPath = FileUtil.getPath(moveFile.srcPath, filename);
      const newPath = FileUtil.getPath(moveFile.targetPath, filename);
      FileUtil.renameFileOrDir(config.rootDir, oldPath, newPath, (err: any) => {
        const response = {
          success: !err,
          oldPath,
          newPath,
          filename,
        };
        return err ? reject(err) : resolve(response);
      });
    });
  });

  Promise.all(promises)
    .then((values) => res.status(200).send(MessageUtil.success('files are moved', values)))
    .catch((err) => next(err));
};

// archive files and directories
export const archive: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  SleepUtil.sleep();

  const bodyObj = req.body as ArchiveFile;

  FileUtil.createArchive(
    config.rootDir,
    bodyObj.relPath,
    bodyObj.fileNames,
    bodyObj.archivedFileName,
    bodyObj.embedDirs,
    (err: any) => {
      if (err) {
        return next(err);
      }
      res.status(200).send(MessageUtil.success(`Archive file ${bodyObj.archivedFileName} is created!`, null));
    },
  );
};

// delete file
export const delete_file: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  SleepUtil.sleep();

  const bodyObj = req.body as DeleteFile;

  const promises = bodyObj.fileNames.map((filename) => {
    return new Promise((resolve, reject) => {
      FileUtil.deleteFile(config.rootDir, bodyObj.relPath, filename, (err: any) => {
        const response = {
          success: !err,
          filename: filename,
          relPath: bodyObj.relPath,
        };
        return err ? reject(err) : resolve(response);
      });
    });
  });

  Promise.all(promises)
    .then((values) => res.status(200).send(MessageUtil.success('file is deleted', values)))
    .catch((err) => next(err));
};
