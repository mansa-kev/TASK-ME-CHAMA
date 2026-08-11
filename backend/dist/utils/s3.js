"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripSignatureFromUrl = exports.signS3Url = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
});
const signS3Url = async (fullUrl) => {
    if (!fullUrl)
        return null;
    // If no AWS credentials, or if it's already a signed URL or mock URL, just return it
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        return fullUrl;
    }
    // Check if it's an AWS S3 URL and not already signed
    if (!fullUrl.includes('amazonaws.com') || fullUrl.includes('X-Amz-Signature')) {
        return fullUrl;
    }
    try {
        const url = new URL(fullUrl);
        // URL pathname usually starts with a slash, e.g., /taskme-chama-bucket/filename or just /filename depending on host style
        let key = url.pathname.substring(1);
        const bucketName = process.env.AWS_BUCKET_NAME || 'taskme-chama-bucket';
        // Handle path-style URLs (s3.amazonaws.com/bucket/key) vs virtual-hosted style (bucket.s3.amazonaws.com/key)
        if (key.startsWith(bucketName + '/')) {
            key = key.replace(bucketName + '/', '');
        }
        const command = new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: key });
        return await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 }); // 1 hour expiration
    }
    catch (e) {
        console.error('Failed to sign S3 URL:', e);
        return fullUrl;
    }
};
exports.signS3Url = signS3Url;
const stripSignatureFromUrl = (fullUrl) => {
    if (!fullUrl)
        return null;
    try {
        const url = new URL(fullUrl);
        url.search = ''; // Strip all query parameters including signature
        return url.toString();
    }
    catch (e) {
        return fullUrl;
    }
};
exports.stripSignatureFromUrl = stripSignatureFromUrl;
//# sourceMappingURL=s3.js.map