import axios, { AxiosInstance} from 'axios';

/**
 * Add request/response interceptors to an axios instance for debugging
 * @param instance The axios instance to configure
 * @param name Optional name for identifying the instance in logs
 */
export const configureAxiosDebug = (instance: AxiosInstance, name: string = 'api') => {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Don't log in production
      if (process.env.NODE_ENV !== 'production') {
        const url = config.url;
        const method = config.method?.toUpperCase();
        
        console.group(`🚀 ${name.toUpperCase()} REQUEST: ${method} ${url}`);
        
        // Log headers without sensitive info
        const safeHeaders = { ...config.headers };
        if (safeHeaders.Authorization) {
          safeHeaders.Authorization = '[REDACTED]';
        }
        console.log('Headers:', safeHeaders);
        
        // Log request body for non-GET requests
        if (config.data && method !== 'GET') {
          // For FormData, log structure instead of content
          if (config.data instanceof FormData) {
            const formDataEntries: Record<string, string> = {};
            config.data.forEach((value, key) => {
              if (value instanceof Blob) {
                formDataEntries[key] = `[File: ${value.size} bytes]`;
              } else {
                formDataEntries[key] = typeof value === 'string' && value.length > 100 
                  ? `${value.substring(0, 100)}...` 
                  : String(value);
              }
            });
            console.log('FormData:', formDataEntries);
          } else {
            console.log('Body:', config.data);
          }
        }
        
        console.groupEnd();
      }
      return config;
    },
    (error) => {
      console.error(`❌ ${name.toUpperCase()} REQUEST ERROR:`, error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV !== 'production') {
        const { config, status, statusText, headers } = response;
        const method = config.method?.toUpperCase();
        const url = config.url;
        
        console.group(`✅ ${name.toUpperCase()} RESPONSE: ${method} ${url} (${status} ${statusText})`);
        console.log('Headers:', headers);
        console.log('Data:', response.data);
        console.groupEnd();
      }
      return response;
    },
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const { config, response } = error;
        const method = config?.method?.toUpperCase();
        const url = config?.url;
        
        console.group(`❌ ${name.toUpperCase()} ERROR: ${method} ${url} (${response.status} ${response.statusText})`);
        console.log('Response headers:', response.headers);
        console.log('Response data:', response.data);
        
        // For 500 errors, add extra debugging info
        if (response.status === 500) {
          console.error('SERVER ERROR DETAILS:', {
            url: `${method} ${url}`,
            requestHeaders: config?.headers,
            requestData: config?.data,
            responseData: response.data
          });
        }
        
        console.groupEnd();
      } else {
        console.error(`❌ ${name.toUpperCase()} NETWORK ERROR:`, error);
      }
      return Promise.reject(error);
    }
  );
};

/**
 * Apply debug interceptors to all axios instances
 */
export const setupGlobalAxiosDebug = () => {
  configureAxiosDebug(axios, 'global');
};

export default configureAxiosDebug;
