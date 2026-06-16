import React from 'react'
import { FloorData, getFloorAvgProgress, getFloorStatus } from '../data/constructionData'

interface Props {
  data: { x: number; y: number; floor: FloorData } | null
}

const STATUS_LABEL: Record<string, string> = {
  completed: '已完工',
  'in-progress': '施工中',
  pending: '未开始',
}

const FloorTooltip: React.FC<Props> = ({ data }) => {
  if (!data) return null
  const avg = getFloorAvgProgress(data.floor)
  const status = getFloorStatus(data.floor)

  return (
    <div className="tooltip-3d" style={{ left: data.x, top: data.y }}>
      <div className="tooltip-title">
        {data.floor.label} - {STATUS_LABEL[status]} ({avg}%)
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">施工班组</span>
        <span className="tooltip-val">{data.floor.team}</span>
      </div>
      {data.floor.tasks.map((task) => (
        <div className="tooltip-row" key={task.name}>
          <span className="tooltip-label">{task.name}</span>
          <span className="tooltip-val">{task.progress}%</span>
        </div>
      ))}
    </div>
  )
}

export default FloorTooltip
