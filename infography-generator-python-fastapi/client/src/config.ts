
// client/src/config.ts

export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    GENERATED_PATH: '/generated',
    API_PATH: '/api'        // 新增的 API 路径
};
