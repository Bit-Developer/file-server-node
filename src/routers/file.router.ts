import express from 'express';
import * as file_controller from '../controllers/file.controller';
import config from '../config/env.config';

class FileRouter {
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get('/list', file_controller.file_list);
    this.router.get('/download', file_controller.download_file);
    if (config.edit_mode) {
      this.router.post('/create', file_controller.create_folder);
      this.router.post('/upload', file_controller.upload_file);
      this.router.post('/rename', file_controller.rename);
      this.router.post('/move', file_controller.move);
      this.router.post('/archive', file_controller.archive);
      this.router.post('/delete', file_controller.delete_file);
    }
  }
}

export default FileRouter;
