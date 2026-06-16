// 建筑施工进度模拟数据

export type TaskStatus = 'completed' | 'in-progress' | 'pending'

export interface Task {
  name: string
  progress: number // 0-100
}

export interface FloorData {
  id: number
  label: string
  team: string
  tasks: Task[]
}

export interface DaySnapshot {
  date: string
  workerCount: number
  floors: FloorData[]
}

const TASK_TYPES = ['水电', '砌墙', '装修', '消防', '通风']

const TEAMS = [
  '一队-张伟班组', '二队-李强班组', '三队-王刚班组',
  '四队-刘洋班组', '五队-陈杰班组', '六队-赵斌班组',
  '七队-周涛班组', '八队-吴鹏班组', '九队-孙磊班组',
  '十队-黄勇班组',
]

const TOTAL_FLOORS = 15

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateDayData(dayIndex: number): DaySnapshot {
  const rand = seededRandom(dayIndex * 137 + 42)
  const date = new Date(2026, 0, 6 + dayIndex) // 2026-01-06 开始
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  const floors: FloorData[] = []
  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    const floorRatio = f / TOTAL_FLOORS
    const timeRatio = dayIndex / 59 // 60天工期
    const baseProgress = Math.max(0, Math.min(100, (timeRatio - (floorRatio - 0.06) * 0.8) * 250))

    const tasks: Task[] = TASK_TYPES.map((name, ti) => {
      const offset = ti * 12
      const raw = baseProgress - offset + (rand() - 0.5) * 18
      return { name, progress: Math.max(0, Math.min(100, Math.round(raw))) }
    })

    floors.push({
      id: f,
      label: f === 1 ? '首层' : f === TOTAL_FLOORS ? '屋面层' : `${f}层`,
      team: TEAMS[(f - 1) % TEAMS.length],
      tasks,
    })
  }

  const baseWorkers = 85 + Math.floor(rand() * 40)
  const workerVariation = Math.sin(dayIndex * 0.3) * 15
  const workerCount = Math.max(60, Math.round(baseWorkers + workerVariation - dayIndex * 0.3))

  return { date: dateStr, workerCount, floors }
}

// 预生成60天数据
export const ALL_SNAPSHOTS: DaySnapshot[] = Array.from({ length: 60 }, (_, i) => generateDayData(i))

export const PROJECT_NAME = '鑫苑·未来城 3#楼'
export const PLAN_DURATION = 60 // 计划工期天数

export function getFloorStatus(floor: FloorData): TaskStatus {
  const avg = floor.tasks.reduce((s, t) => s + t.progress, 0) / floor.tasks.length
  if (avg >= 99.5) return 'completed'
  if (avg > 0.5) return 'in-progress'
  return 'pending'
}

export function getFloorAvgProgress(floor: FloorData): number {
  return Math.round(floor.tasks.reduce((s, t) => s + t.progress, 0) / floor.tasks.length)
}

export function getOverallProgress(snapshot: DaySnapshot): number {
  const total = snapshot.floors.reduce((s, f) => s + getFloorAvgProgress(f), 0)
  return Math.round(total / snapshot.floors.length)
}
