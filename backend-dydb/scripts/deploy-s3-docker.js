require('dotenv').config();
const { execSync } = require('child_process');

async function deployToS3() {
    try {
        console.log('Starting S3 deployment using Docker...');
        
        // Skip bucket creation if it already exists
        try {
            execSync(`docker-compose run --rm aws-cli s3 mb s3://${process.env.S3_BUCKET_NAME}`, 
                { stdio: 'inherit' });
        } catch (error) {
            console.log('Bucket already exists, continuing with deployment...');
        }
        
        // Configure website
        execSync(`docker-compose run --rm aws-cli s3 website s3://${process.env.S3_BUCKET_NAME} --index-document index.html`, 
            { stdio: 'inherit' });
        
        // Sync files
        execSync(`docker-compose run --rm aws-cli s3 sync /aws/public s3://${process.env.S3_BUCKET_NAME} --delete`, 
            { stdio: 'inherit' });
        
        console.log('Deployment complete!');
    } catch (error) {
        console.error('Deployment failed:', error);
    }
}

deployToS3(); 