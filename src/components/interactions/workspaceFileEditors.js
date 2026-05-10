import EvFileBrief from '@/components/interactions/EvFileBrief.vue'
import EvFileCanvas from '@/components/interactions/EvFileCanvas.vue'
import EvFileChat from '@/components/interactions/EvFileChat.vue'
import EvFileEntity from '@/components/interactions/EvFileEntity.vue'
import EvFileForge from '@/components/interactions/EvFileForge.vue'
import EvFileJs from '@/components/interactions/EvFileJs.vue'
import EvFileLog from '@/components/interactions/EvFileLog.vue'
import EvFileLogic from '@/components/interactions/EvFileLogic.vue'
import EvFileMission from '@/components/interactions/EvFileMission.vue'
import EvFileMotion from '@/components/interactions/EvFileMotion.vue'
import EvFileNote from '@/components/interactions/EvFileNote.vue'
import EvFilePlan from '@/components/interactions/EvFilePlan.vue'
import EvFileResearch from '@/components/interactions/EvFileResearch.vue'
import EvFileScene from '@/components/interactions/EvFileScene.vue'
import EvFileSchema from '@/components/interactions/EvFileSchema.vue'
import EvFileSim from '@/components/interactions/EvFileSim.vue'
import EvFileSpec from '@/components/interactions/EvFileSpec.vue'
import EvFileStoryboard from '@/components/interactions/EvFileStoryboard.vue'
import EvFileSystem from '@/components/interactions/EvFileSystem.vue'
import EvFileTimeline from '@/components/interactions/EvFileTimeline.vue'
import EvFileTs from '@/components/interactions/EvFileTs.vue'

export const workspaceFileEditors = Object.freeze({
  motion: EvFileMotion,
  timeline: EvFileTimeline,
  storyboard: EvFileStoryboard,
  scene: EvFileScene,
  sim: EvFileSim,
  entity: EvFileEntity,
  mission: EvFileMission,
  js: EvFileJs,
  ts: EvFileTs,
  logic: EvFileLogic,
  schema: EvFileSchema,
  canvas: EvFileCanvas,
  chat: EvFileChat,
  note: EvFileNote,
  log: EvFileLog,
  brief: EvFileBrief,
  research: EvFileResearch,
  forge: EvFileForge,
  plan: EvFilePlan,
  spec: EvFileSpec,
  system: EvFileSystem,
})
