// config.ts
interface Config {
    apiBaseUrl: string;
    mockServiceUrl: string;
    boardgameUrl: string;
}

// Environment-specific configurations
const configs: Record<string, Config> = {
    development: {
        apiBaseUrl: 'http://localhost:7001',
        mockServiceUrl: 'http://localhost:7002',
        boardgameUrl: 'http://localhost:9001',
    },
    test: {
        apiBaseUrl: 'https://api.jingpersonal.click:6001',
        mockServiceUrl: 'https://mock.jingpersonal.click:6002',
        boardgameUrl: 'http://localhost:9001',
    },
    production: {
        apiBaseUrl: 'https://api.jingpersonal.click:6001',
        mockServiceUrl: 'https://mock.jingpersonal.click:6002',
        boardgameUrl: 'http://localhost:9001',
    },
};

// Determine which environment to use
// This could be set based on environment variables in a real application
const environment = process.env.NODE_ENV || 'development';

// Export the appropriate configuration
export const config = configs[environment] || configs.development;