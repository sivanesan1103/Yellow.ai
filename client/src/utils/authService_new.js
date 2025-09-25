import axios from 'axios';

class AuthService {
    constructor() {
        this.baseURL = this.getServerURL();
        this.api = this.createAxiosInstance();
        this.setupInterceptors();
    }

    getServerURL() {
        // Get server URL with fallback logic
        let serverURL = import.meta.env.VITE_SERVER_URL;
        
        // If no environment variable, try to detect
        if (!serverURL) {
            if (typeof window !== 'undefined') {
                const { protocol, hostname } = window.location;
                
                // If localhost, use port 3000
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    serverURL = `${protocol}//${hostname}:3000`;
                } else {
                    // For production, assume server is on same domain with port 3000
                    serverURL = `${protocol}//${hostname}:3000`;
                }
            } else {
                serverURL = 'http://localhost:3000';
            }
        }

        // Remove trailing slash
        return serverURL.endsWith('/') ? serverURL.slice(0, -1) : serverURL;
    }

    createAxiosInstance() {
        const instance = axios.create({
            baseURL: this.baseURL,
            timeout: 15000, // 15 second timeout
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        return instance;
    }

    setupInterceptors() {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => {
                console.log(`✅ API Success: ${response.status} ${response.config.url}`);
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                
                // Log the error with more detail
                if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
                    console.error(`❌ Connection Error: Cannot connect to server at ${this.baseURL}`);
                    console.error('🔍 Troubleshooting:');
                    console.error('   1. Check if server is running');
                    console.error('   2. Verify server URL is correct');
                    console.error('   3. Check for CORS issues');
                    
                    throw new Error(`Cannot connect to server at ${this.baseURL}. Please ensure the server is running.`);
                }

                if (error.response) {
                    console.error(`❌ API Error: ${error.response.status} ${originalRequest.url}`);
                    
                    // Handle 401 Unauthorized - try token refresh
                    if (error.response.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true;
                        
                        try {
                            await this.refreshToken();
                            return this.api(originalRequest);
                        } catch (refreshError) {
                            console.error('❌ Token refresh failed');
                            this.logout();
                            throw new Error('Session expired. Please login again.');
                        }
                    }
                } else {
                    console.error('❌ Network Error:', error.message);
                }

                return Promise.reject(error);
            }
        );
    }

    // Test connection to server
    async testConnection() {
        try {
            console.log(`🔍 Testing connection to: ${this.baseURL}`);
            const response = await this.api.get('/health');
            console.log('✅ Server connection successful');
            return { success: true, message: 'Server is reachable' };
        } catch (error) {
            console.error('❌ Server connection failed:', error.message);
            return { 
                success: false, 
                message: `Cannot connect to server at ${this.baseURL}`,
                error: error.message
            };
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await this.api.post('/api/user/register', userData);
            
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user || {}));
            }
            
            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            throw this.handleError(error);
        }
    }

    // Login user
    async login(credentials) {
        try {
            const response = await this.api.post('/api/auth/login', credentials);
            
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user || {}));
            }
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw this.handleError(error);
        }
    }

    // Google OAuth login
    initiateGoogleAuth() {
        const authURL = `${this.baseURL}/api/auth/google`;
        console.log(`🔄 Redirecting to Google OAuth: ${authURL}`);
        window.location.href = authURL;
    }

    // Handle OAuth callback
    async handleOAuthCallback() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            
            if (token) {
                localStorage.setItem('token', token);
                
                // Get user data
                const userData = await this.getCurrentUser();
                localStorage.setItem('user', JSON.stringify(userData));
                
                return { success: true, user: userData };
            }
            
            throw new Error('No token received from OAuth');
        } catch (error) {
            console.error('OAuth callback error:', error);
            throw this.handleError(error);
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const response = await this.api.get('/api/user/data');
            return response.data;
        } catch (error) {
            console.error('Get user error:', error);
            throw this.handleError(error);
        }
    }

    // Refresh token
    async refreshToken() {
        try {
            const response = await this.api.post('/api/auth/refresh');
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            
            return response.data;
        } catch (error) {
            console.error('Token refresh error:', error);
            throw this.handleError(error);
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    }

    // Get stored user
    getStoredUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing stored user:', error);
            return null;
        }
    }

    // Get auth token
    getToken() {
        return localStorage.getItem('token');
    }

    // Handle errors consistently
    handleError(error) {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        }
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            return new Error(`Cannot connect to server. Please ensure the server is running at ${this.baseURL}`);
        }
        
        return new Error(error.message || 'An unexpected error occurred');
    }

    // Get server info for debugging
    getServerInfo() {
        return {
            baseURL: this.baseURL,
            envURL: import.meta.env.VITE_SERVER_URL,
            isAuthenticated: this.isAuthenticated(),
            hasToken: !!this.getToken(),
            user: this.getStoredUser()
        };
    }
}

// Create singleton instance
const authService = new AuthService();

// Add global debug function
if (typeof window !== 'undefined') {
    window.authService = authService;
    window.debugAuth = () => {
        console.log('🔍 Auth Service Debug Info:', authService.getServerInfo());
    };
}

export default authService;