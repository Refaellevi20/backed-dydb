import Axios from 'axios'

// Use your actual backend URL here
const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? 'http://backend-dydb-app-2025.s3-website-eu-west-1.amazonaws.com'
    : 'http://localhost:3030'

const BASE_URL = `${BACKEND_URL}/api/`

const axios = Axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://backend-dydb-app-2025.s3-website-eu-west-1.amazonaws.com'
    }
}) 