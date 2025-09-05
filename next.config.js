/** @type {import('tailwindcss').Config} */
module.exports = {
  env: {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'sistema_fila',
    WEBHOOK_URL: process.env.WEBHOOK_URL || 'https://webhook.site/your-unique-url',
  },
}
