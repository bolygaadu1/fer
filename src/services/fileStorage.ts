/**
 * File Storage Service - Using hosting file system
 * 
 * This service handles file uploads to the hosting service's /uploads folder
 */

export interface StoredFile {
  name: string;
  size: number;
  type: string;
  path: string;
  url?: string;
}

class FileStorageService {
  private static instance: FileStorageService;
  private static readonly API_BASE = '/api';
  
  private constructor() {}
  
  public static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }
  
  // Upload file to hosting service
  public async saveFile(file: File): Promise<StoredFile> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${FileStorageService.API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      
      const storedFile: StoredFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        path: result.path,
        url: result.url
      };
      
      return storedFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  // Get file info by path
  public async getFile(path: string): Promise<StoredFile | null> {
    try {
      const response = await fetch(`${FileStorageService.API_BASE}/files${path}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get file info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting file:', error);
      return null;
    }
  }
  
  // Get all stored files
  public async getAllFiles(): Promise<StoredFile[]> {
    try {
      const response = await fetch(`${FileStorageService.API_BASE}/files`);
      
      if (!response.ok) {
        throw new Error('Failed to get files list');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting files list:', error);
      return [];
    }
  }
  
  // Clear all stored files
  public async clearAllFiles(): Promise<boolean> {
    try {
      const response = await fetch(`${FileStorageService.API_BASE}/files`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch (error) {
      console.error('Error clearing files:', error);
      return false;
    }
  }
  
  // Create a download URL for a file
  public createDownloadUrl(file: StoredFile): string {
    return file.url || `/uploads/${file.name}`;
  }
}

export const fileStorage = FileStorageService.getInstance();