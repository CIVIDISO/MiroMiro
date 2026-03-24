import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Basic auth plugin for Vite dev server (production on Railway)
function basicAuthPlugin() {
  return {
    name: 'basic-auth',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const password = process.env.APP_PASSWORD
        if (!password) return next() // No password = no auth (local dev)

        const auth = req.headers.authorization
        if (auth) {
          const encoded = auth.split(' ')[1]
          if (encoded) {
            const decoded = Buffer.from(encoded, 'base64').toString()
            const pass = decoded.split(':')[1]
            if (pass === password) return next()
          }
        }

        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="MiroMiro"')
        res.end('Access denied. Please provide the correct password.')
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [basicAuthPlugin(), vue()],
  server: {
    port: 3000,
    allowedHosts: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
