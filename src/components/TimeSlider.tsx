import React from 'react'

interface Props {
  totalDays: number
  currentIndex: number
  currentDate: string
  onChange: (index: number) => void
}

const TimeSlider: React.FC<Props> = ({ totalDays, currentIndex, currentDate, onChange }) => {
  return (
    <div className="timeline-bar">
      <div className="timeline-header">
        <span className="timeline-title">施工进度时间轴</span>
        <span className="timeline-date">{currentDate}</span>
      </div>
      <div className="timeline-dates">
        <span>2026-01-06</span>
        <span>施工中...</span>
        <span>2026-03-06</span>
      </div>
      <input
        className="timeline-slider"
        type="range"
        min={0}
        max={totalDays - 1}
        value={currentIndex}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export default TimeSlider
