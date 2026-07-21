import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolveBasePath } from './src/utils/basePath'

export default defineConfig({
  base: resolveBasePath({
    repository: process.env.GITHUB_REPOSITORY,
    isGitHubActions: process.env.GITHUB_ACTIONS === 'true',
    override: process.env.VITE_BASE_PATH,
  }),
  plugins: [react()],
})
