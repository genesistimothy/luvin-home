import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas/index.js'
import {structure} from './structure.js'

const singletonTypes = new Set(['homepage', 'siteSettings'])

export default defineConfig({
  name: 'luvin-home',
  title: 'LUVIN HOME',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'p3ihfsxq',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },
  document: {
    newDocumentOptions: (options) => options.filter(({templateId}) => !singletonTypes.has(templateId)),
    actions: (actions, context) =>
      singletonTypes.has(context.schemaType)
        ? actions.filter(({action}) => !['delete', 'duplicate'].includes(action))
        : actions,
  },
})
