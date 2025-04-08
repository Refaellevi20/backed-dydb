const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? 'http://backend-dydb-app-2025.s3-website-eu-west-1.amazonaws.com'
    : 'http://localhost:3030'

const baseUrl = BACKEND_URL 