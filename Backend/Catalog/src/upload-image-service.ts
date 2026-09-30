import fs from "fs";
import path from "path";
import {randomUUID} from "crypto";
import {NextFunction, Request, Response} from "express";
import multer from "multer";
import {ValidationError} from "@nltech/rest";

// Uploaded product photos are saved in Backend/Catalog/uploads and served at /api/products/images/<file>.
// To move to Cloudinary later, only the `storage` below needs to change (e.g. to CloudinaryStorage).
export const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
export const IMAGES_URL_PREFIX = "/api/products/images/";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
};

class UploadImageService {

    private readonly upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, callback) => {
                fs.mkdirSync(UPLOADS_DIR, {recursive: true});
                callback(null, UPLOADS_DIR);
            },
            // A random name, so users can't overwrite each other's files or guess paths.
            filename: (req, file, callback) => callback(null, randomUUID() + EXTENSIONS[file.mimetype]),
        }),
        fileFilter: (req, file, callback) => {
            if (EXTENSIONS[file.mimetype]) callback(null, true);
            else callback(new ValidationError("Only JPG, PNG, WEBP or GIF images are allowed"));
        },
        limits: {fileSize: MAX_FILE_SIZE, files: 1},
    });

    // Middleware for an optional single file in the "image" form field.
    // Turns multer's own errors (e.g. file too large) into a 400 instead of a 500.
    public single(fieldName: string) {
        const middleware = this.upload.single(fieldName);
        return (req: Request, res: Response, next: NextFunction) => {
            middleware(req, res, (err?: unknown) => {
                if (err instanceof multer.MulterError) {
                    const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be at most 5 MB" : err.message;
                    return next(new ValidationError(message));
                }
                next(err);
            });
        };
    }

    public toImageUrl(file: Express.Multer.File): string {
        return IMAGES_URL_PREFIX + file.filename;
    }

    public isUploadedImage(imageUrl: string | null | undefined): boolean {
        return !!imageUrl && imageUrl.startsWith(IMAGES_URL_PREFIX);
    }

    // Deletes a photo we stored (external links like Wikimedia URLs are left alone).
    public async deleteImage(imageUrl: string | null | undefined): Promise<void> {
        if (!this.isUploadedImage(imageUrl)) return;
        const fileName = path.basename(imageUrl!);
        await fs.promises.unlink(path.join(UPLOADS_DIR, fileName)).catch(() => undefined);
    }
}

export const uploadImageService = new UploadImageService();
