import React from 'react'
import { DaySnapshot, getOverallProgress, PLAN_DURATION, PROJECT_NAME } from '../data/constructionData'

interface Props {
  snapshot: DaySnapshot
  dayIndex: number
}

const HUD: React.FC<Props> = ({ snapshot, dayIndex }) => {
  const overall = getOverallProgress(snapshot)
  const usedDays = dayIndex + 1

  return (
    <div className="hud-bar">
      <div style={{ position: 'absolute', left: 20, fontSize: 15, fontWeight: 700, color: '#94a3b8' }}>
        {PROJECT_NAME}
      </div>
      <div className="hud-item">
        <span className="hud-label">总体完成率</span>
        <span className={`hud-value ${overall >= 90 ? 'green' : overall >= 50 ? '' : 'amber'}`}>
          {overall}%
        </span>
      </div>
      <div className="hud-item">
        <span className="hud-label">计划工期</span>
        <span className="hud-value">{PLAN_DURATION}天</span>
      </div>
      <div className="hud-item">
        <span className="hud-label">已用工期</span>
        <span className={`hud-value ${usedDays > PLAN_DURATION ? 'amber' : ''}`}>
          {usedDays}天
        </span>
      </div>
      <div className="hud-item">
        <span className="hud-label">施工人数</span>
        <span className="hud-value green">{snapshot.workerCount}人</span>
      </div>
    </div>
  )
}

export default HUD
