// config.ts
interface Config {
    apiBaseUrl: string;
    mockServiceUrl: string;
}

// Environment-specific configurations
const configs: Record<string, Config> = {
    development: {
        apiBaseUrl: 'http://localhost:7001',
        mockServiceUrl: 'http://localhost:7002',
    },
    test: {
        apiBaseUrl: 'https://13.61.17.9:7001',
        mockServiceUrl: 'https://13.61.17.9:7002',
    },
    production: {
        apiBaseUrl: 'https://13.61.17.9:7001',
        mockServiceUrl: 'https://13.61.17.9:7002',
    },
};

// Determine which environment to use
// This could be set based on environment variables in a real application
const environment = process.env.NODE_ENV || 'development';

// Export the appropriate configuration
export const config = configs[environment] || configs.development;