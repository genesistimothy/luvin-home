import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'p3ihfsxq',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  studioHost: 'luvin-home',
  deployment: {
    appId: 'kl9klq403t90o8fq2galpi6b',
  },
})
