require('dotenv').config()
const { 
    S3Client, 
    CreateBucketCommand,
    PutBucketPolicyCommand,
    PutBucketWebsiteCommand 
} = require('@aws-sdk/client-s3');
const fs = require('fs');

// Add console.log to debug environment variables
console.log('AWS Region:', process.env.AWS_REGION);
console.log('Bucket Name:', process.env.S3_BUCKET_NAME);

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-1', // Provide a default region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function setupS3Bucket() {
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
        // Create bucket
        await s3Client.send(new CreateBucketCommand({
            Bucket: bucketName
        }));
        console.log(`Created bucket: ${bucketName}`);

        // Configure static website hosting
        await s3Client.send(new PutBucketWebsiteCommand({
            Bucket: bucketName,
            WebsiteConfiguration: {
                IndexDocument: { Suffix: 'index.html' },
                ErrorDocument: { Key: 'error.html' }
            }
        }));
        console.log('Configured bucket for static website hosting');

        // Set bucket policy
        const policy = fs.readFileSync('./s3-policy.json', 'utf-8')
            .replace('your-bucket-name', bucketName);
        
        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: policy
        }));
        console.log('Applied bucket policy');

    } catch (err) {
        console.error('Error setting up S3:', err);
    }
}

setupS3Bucket().catch(console.error); 