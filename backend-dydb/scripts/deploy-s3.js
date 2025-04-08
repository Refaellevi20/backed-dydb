const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadFile(filePath, bucketPath) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const command = new PutObjectCommand({
            Bucket: 'backend-dydb-app-2025',
            Key: bucketPath,
            Body: fileContent,
            ContentType: getContentType(filePath)
        });

        await s3Client.send(command);
        console.log(`Successfully uploaded ${filePath} to ${BUCKET_NAME}/${bucketPath}`);
    } catch (err) {
        console.error(`Error uploading ${filePath}:`, err);
    }
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

async function deployToS3() {
    const publicDir = path.join(__dirname, '../public');
    
    async function uploadDirectory(dirPath, baseDir) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                await uploadDirectory(filePath, baseDir);
            } else {
                const bucketPath = path.relative(baseDir, filePath);
                await uploadFile(filePath, bucketPath);
            }
        }
    }

    await uploadDirectory(publicDir, publicDir);
    console.log('Deployment complete!');
}

deployToS3().catch(console.error); 