import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // ... (outras configurações que você possa ter)

    // 👇 ADICIONE ESTE BLOCO 👇
    define: {
        'global': 'window',
    },
})
