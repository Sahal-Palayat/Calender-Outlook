import { config } from "dotenv";
config()
const AppConfig =  {
    port: process.env.PORT || 3000,
    apiPrefix: '/api',
    jwtSecret: process.env.JWT_SECRET || 'sahalikka-secret',
    jwtExpiresIn: '12h',
}

export default AppConfig;