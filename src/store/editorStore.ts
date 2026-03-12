
import {create} from 'zustand'

export const useEditorStore = create(set=>({
  objects:[],
  addObject:(o)=>set(s=>({objects:[...s.objects,o]}))
}))
