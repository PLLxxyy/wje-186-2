import React from 'react'
import { getFloorStatus, getFloorAvgProgress, FloorData } from '../data/constructionData'

interface Props {
  floors: FloorData[]
  activeFloor: number | null
  onSelect: (floorIndex: number) => void
}

const STATUS_LABEL: Record<string, string> = {
  completed: '已完工',
  'in-progress': '施工中',
  pending: '未开始',
}

const TASK_COLORS: Record<string, string> = {
  completed: '#4ade80',
  'in-progress': '#fbbf24',
  pending: '#475569',
}

function getBarColor(progress: number): string {
  if (progress >= 99.5) return '#4ade80'
  if (progress > 0.5) return '#38bdf8'
  return '#475569'
}

const FloorPanel: React.FC<Props> = ({ floors, activeFloor, onSelect }) => {
  return (
    <div className="floor-panel">
      {floors.map((floor, i) => {
        const status = getFloorStatus(floor)
        const avg = getFloorAvgProgress(floor)
        const isActive = activeFloor === i

        return (
          <div
            key={floor.id}
            className={`floor-card${isActive ? ' active' : ''}`}
            onClick={() => onSelect(i)}
          >
            <div className="floor-card-header">
              <span className="floor-name">
                {floor.label}
                <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>{floor.team}</span>
              </span>
              <span className={`floor-status ${status}`}>
                {STATUS_LABEL[status]} {avg}%
              </span>
            </div>
            {floor.tasks.map((task) => (
              <div className="task-row" key={task.name}>
                <span className="task-name">{task.name}</span>
                <div className="task-bar-bg">
                  <div
                    className="task-bar-fill"
                    style={{
                      width: `${task.progress}%`,
                      background: getBarColor(task.progress),
                    }}
                  />
                </div>
                <span className="task-pct">{task.progress}%</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default FloorPanel
