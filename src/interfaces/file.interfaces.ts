export interface FileItem {
  name: string;
  relPath: string;
  isDir: boolean;
  size: number;
  createdAt: number;
  updatedAt: number;
}

/* export interface SearchFolder {
  relPath: string;
} */

export interface CreateFolder {
  relPath: string;
  folderName: string;
}

export interface UploadFolder {
  relPath: string;
}

export interface RenameFile {
  oldPath: string;
  newPath: string;
}

export interface MoveFile {
  srcPath: string;
  targetPath: string;
  fileNames: string[];
}

export interface ArchiveFile {
  relPath: string;
  fileNames: string[];
  archivedFileName: string;
  embedDirs: boolean;
}

export interface DeleteFile {
  relPath: string;
  fileNames: string[];
}

export interface NavPath {
  name: string;
  path: string;
}
