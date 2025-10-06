import { ipcRenderer } from 'electron'

export function buildApiFromTree(tree: any, prefix = '') {
  const obj: any = {}
  for (const key in tree) {
    if (tree[key] === true) {
      obj[key] = (args?: any) => ipcRenderer.invoke(`${prefix}${key}`, args)
    } else {
      obj[key] = buildApiFromTree(tree[key], `${prefix}${key}:`)
    }
  }
  return obj
}
