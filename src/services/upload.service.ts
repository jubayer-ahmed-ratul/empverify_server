import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export class UploadService {
  async uploadEmployeePhoto(
    buffer: Buffer,
    employeeId: string
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'employees',
          public_id: `employee_${employeeId}_${Date.now()}`,
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' },
          ],
          format: 'jpg',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  async deleteEmployeePhoto(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Don't throw error - log and continue
    }
  }

  getOptimizedImageUrl(
    url: string,
    transformation: 'thumbnail' | 'medium' | 'large' | 'card'
  ): string {
    if (!url) return '';

    const transformations = {
      thumbnail: 'w_150,h_150,c_fill,q_auto,f_auto',
      medium: 'w_400,h_400,c_limit,q_auto,f_auto',
      large: 'w_800,h_800,c_limit,q_auto,f_auto',
      card: 'w_300,h_400,c_fill,q_auto,f_auto',
    };

    // Insert transformation into Cloudinary URL
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${transformations[transformation]}/${parts[1]}`;
    }

    return url;
  }
}

export const uploadService = new UploadService();
