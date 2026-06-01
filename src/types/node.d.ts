// Node.js v21+ provides import.meta.dirname/filename
// This augments TypeScript's ImportMeta to include them.
interface ImportMeta {
  dirname: string
  filename: string
}
