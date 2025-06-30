// Configuration file for environment variables
export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
  },
  auth: {
    secret: process.env.AUTH_SECRET || '',
    github: {
      id: process.env.AUTH_GITHUB_ID || '',
      secret: process.env.AUTH_GITHUB_SECRET || '',
    },
    google: {
      id: process.env.AUTH_GOOGLE_ID || '',
      secret: process.env.AUTH_GOOGLE_SECRET || '',
    },
  },
  mongodb: {
    uri: process.env.MONGODB_URI || '',
  },
  neo4j: {
    uri: process.env.NEO4J_URI || '',
    username: process.env.NEO4J_USERNAME || '',
    password: process.env.NEO4J_PASSWORD || '',
  },
};

// Validate required configurations
export const validateConfig = () => {
  const required = [
    'openai.apiKey',
    'auth.secret',
    'mongodb.uri',
  ];

  const missing = required.filter(key => {
    const keys = key.split('.');
    let value: any = config;
    for (const k of keys) {
      value = value?.[k];
    }
    return !value;
  });

  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    return false;
  }

  return true;
}; 