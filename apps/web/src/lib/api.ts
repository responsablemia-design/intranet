// URL para peticiones desde el servidor SvelteKit (dentro de Docker)
export const API_URL = process.env.API_URL || 'http://api:3000'

// URL para peticiones desde el navegador (fuera de Docker)
export const PUBLIC_API_URL = process.env.PUBLIC_API_URL || 'http://172.30.200.240:3000'
