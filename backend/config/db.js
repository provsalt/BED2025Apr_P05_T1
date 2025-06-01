import dotenv from 'dotenv'

dotenv.config()

export const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    trustServerCertificate: true,
    options: {
        port: parseInt(process.env.DB_PORT),
    },
}
