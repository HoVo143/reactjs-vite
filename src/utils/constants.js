
// có 2 cách sử dụng
// 1: import.meta.env trên trang chính của vite
// 2: sử dụng 'process.env': process.env bên file vite.config.js
let apiRoot = ''
console.log('import.meta.env', import.meta.env)
console.log('process.env: ', process.env)

if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:8017'
}

if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://trello-api-a1f8.onrender.com'
}
// export const API_ROOT = 'http://localhost:8017'
export const API_ROOT = apiRoot
