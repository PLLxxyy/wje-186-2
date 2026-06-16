import { describe, it, expect } from 'vitest'
import {
  getPlannedProgress,
  getPlannedDayForProgress,
  getProgressDeviation,
  isBehindSchedule,
  getFloorAvgProgress,
  ALL_SNAPSHOTS,
  PLAN_DURATION,
} from './constructionData'

describe('计划进度函数与反函数一致性', () => {
  it('给定天数，正函数求进度再反函数求天数应接近原值', () => {
    const floorId = 5
    for (let day = 0; day < PLAN_DURATION; day++) {
      const progress = getPlannedProgress(floorId, day)
      if (progress > 0 && progress < 100) {
        const dayEstimated = getPlannedDayForProgress(floorId, progress)
        expect(Math.abs(dayEstimated - day)).toBeLessThan(1)
      }
    }
  })

  it('给定进度值，反函数求天数再正函数求进度应接近原值', () => {
    const floorId = 8
    for (let p = 5; p <= 95; p += 5) {
      const day = getPlannedDayForProgress(floorId, p)
      const progressEstimated = getPlannedProgress(floorId, day)
      expect(Math.abs(progressEstimated - p)).toBeLessThan(2)
    }
  })

  it('低层楼进度增长快，高层楼进度增长慢', () => {
    const day = 29
    const lowFloorProgress = getPlannedProgress(1, day)
    const highFloorProgress = getPlannedProgress(15, day)
    expect(lowFloorProgress).toBeGreaterThan(highFloorProgress)
  })
})

describe('偏差天数计算逻辑', () => {
  it('当实际进度等于计划进度时，偏差应为0', () => {
    const floorId = 5
    const dayIndex = 29
    const plannedProgress = getPlannedProgress(floorId, dayIndex)
    const mockFloor = {
      id: floorId,
      label: '5层',
      team: '测试班组',
      tasks: [
        { name: '水电', progress: plannedProgress },
        { name: '砌墙', progress: plannedProgress },
        { name: '装修', progress: plannedProgress },
        { name: '消防', progress: plannedProgress },
        { name: '通风', progress: plannedProgress },
      ],
    }
    const deviation = getProgressDeviation(mockFloor, dayIndex)
    expect(deviation).toBe(0)
  })

  it('当实际进度高于计划进度时，偏差应为正（超前）', () => {
    const floorId = 5
    const dayIndex = 29
    const plannedProgress = getPlannedProgress(floorId, dayIndex)
    const actualProgress = Math.min(100, plannedProgress + 20)
    const mockFloor = {
      id: floorId,
      label: '5层',
      team: '测试班组',
      tasks: [
        { name: '水电', progress: actualProgress },
        { name: '砌墙', progress: actualProgress },
        { name: '装修', progress: actualProgress },
        { name: '消防', progress: actualProgress },
        { name: '通风', progress: actualProgress },
      ],
    }
    const deviation = getProgressDeviation(mockFloor, dayIndex)
    expect(deviation).toBeGreaterThan(0)
  })

  it('当实际进度低于计划进度时，偏差应为负（落后）', () => {
    const floorId = 5
    const dayIndex = 29
    const plannedProgress = getPlannedProgress(floorId, dayIndex)
    const actualProgress = Math.max(0, plannedProgress - 20)
    const mockFloor = {
      id: floorId,
      label: '5层',
      team: '测试班组',
      tasks: [
        { name: '水电', progress: actualProgress },
        { name: '砌墙', progress: actualProgress },
        { name: '装修', progress: actualProgress },
        { name: '消防', progress: actualProgress },
        { name: '通风', progress: actualProgress },
      ],
    }
    const deviation = getProgressDeviation(mockFloor, dayIndex)
    expect(deviation).toBeLessThan(0)
  })

  it('isBehindSchedule 与偏差天数符号一致', () => {
    const floorId = 8
    for (let day = 0; day < PLAN_DURATION; day++) {
      const plannedProgress = getPlannedProgress(floorId, day)
      const offsets = [-25, -10, 0, 10, 25]
      for (const offset of offsets) {
        const actualProgress = Math.max(0, Math.min(100, plannedProgress + offset))
        const mockFloor = {
          id: floorId,
          label: `${floorId}层`,
          team: '测试班组',
          tasks: [
            { name: '水电', progress: actualProgress },
            { name: '砌墙', progress: actualProgress },
            { name: '装修', progress: actualProgress },
            { name: '消防', progress: actualProgress },
            { name: '通风', progress: actualProgress },
          ],
        }
        const deviation = getProgressDeviation(mockFloor, day)
        const behind = isBehindSchedule(mockFloor, day)
        if (deviation < 0) {
          expect(behind).toBe(true)
        } else if (deviation > 0) {
          expect(behind).toBe(false)
        }
      }
    }
  })
})

describe('楼层列表与3D红框一致性验证', () => {
  it('遍历所有天数和楼层，验证 isBehindSchedule 与偏差符号一致', () => {
    let totalFloors = 0
    let behindFloors = 0
    let aheadFloors = 0
    let onScheduleFloors = 0

    for (let dayIndex = 0; dayIndex < ALL_SNAPSHOTS.length; dayIndex++) {
      const snapshot = ALL_SNAPSHOTS[dayIndex]
      for (const floor of snapshot.floors) {
        totalFloors++
        const deviation = getProgressDeviation(floor, dayIndex)
        const behind = isBehindSchedule(floor, dayIndex)

        if (deviation < 0) {
          expect(behind).toBe(true)
          behindFloors++
        } else if (deviation > 0) {
          expect(behind).toBe(false)
          aheadFloors++
        } else {
          onScheduleFloors++
        }
      }
    }

    expect(totalFloors).toBe(ALL_SNAPSHOTS.length * 15)
    expect(behindFloors).toBeGreaterThan(0)
    expect(aheadFloors).toBeGreaterThan(0)
  })

  it('验证3D红框逻辑与列表偏差天数一致（同一数据源）', () => {
    const dayIndex = 29
    const snapshot = ALL_SNAPSHOTS[dayIndex]

    const fromIsBehind = snapshot.floors.map((f) => isBehindSchedule(f, dayIndex))
    const fromDeviation = snapshot.floors.map((f) => getProgressDeviation(f, dayIndex) < 0)

    for (let i = 0; i < snapshot.floors.length; i++) {
      expect(fromIsBehind[i]).toBe(fromDeviation[i])
    }
  })

  it('实际进度与计划进度的比较方向正确', () => {
    const dayIndex = 30
    const snapshot = ALL_SNAPSHOTS[dayIndex]

    for (const floor of snapshot.floors) {
      const actualProgress = getFloorAvgProgress(floor)
      const plannedProgress = getPlannedProgress(floor.id, dayIndex)
      const deviation = getProgressDeviation(floor, dayIndex)

      if (actualProgress > plannedProgress + 2) {
        expect(deviation).toBeGreaterThan(0)
      }
      if (actualProgress < plannedProgress - 2) {
        expect(deviation).toBeLessThan(0)
      }
    }
  })

  it('偏差天数的数量级合理（不超过总工期）', () => {
    for (let dayIndex = 0; dayIndex < ALL_SNAPSHOTS.length; dayIndex++) {
      const snapshot = ALL_SNAPSHOTS[dayIndex]
      for (const floor of snapshot.floors) {
        const deviation = getProgressDeviation(floor, dayIndex)
        expect(Math.abs(deviation)).toBeLessThanOrEqual(PLAN_DURATION)
      }
    }
  })
})

describe('边界场景测试', () => {
  it('进度为0%且计划也为0%时，偏差为0', () => {
    const mockFloor = {
      id: 15,
      label: '屋面层',
      team: '测试班组',
      tasks: [
        { name: '水电', progress: 0 },
        { name: '砌墙', progress: 0 },
        { name: '装修', progress: 0 },
        { name: '消防', progress: 0 },
        { name: '通风', progress: 0 },
      ],
    }
    const deviation = getProgressDeviation(mockFloor, 0)
    expect(deviation).toBe(0)
  })

  it('进度为100%且计划也为100%时，偏差为0', () => {
    const mockFloor = {
      id: 1,
      label: '首层',
      team: '测试班组',
      tasks: [
        { name: '水电', progress: 100 },
        { name: '砌墙', progress: 100 },
        { name: '装修', progress: 100 },
        { name: '消防', progress: 100 },
        { name: '通风', progress: 100 },
      ],
    }
    const deviation = getProgressDeviation(mockFloor, PLAN_DURATION - 1)
    expect(deviation).toBe(0)
  })

  it('同一天内，偏差随实际进度增加而增加（单调递增）', () => {
    const floorId = 5
    const dayIndex = 29
    let prevDeviation = -Infinity

    for (let p = 0; p <= 100; p += 5) {
      const mockFloor = {
        id: floorId,
        label: `${floorId}层`,
        team: '测试班组',
        tasks: [
          { name: '水电', progress: p },
          { name: '砌墙', progress: p },
          { name: '装修', progress: p },
          { name: '消防', progress: p },
          { name: '通风', progress: p },
        ],
      }
      const deviation = getProgressDeviation(mockFloor, dayIndex)
      expect(deviation).toBeGreaterThanOrEqual(prevDeviation - 1)
      prevDeviation = deviation
    }
  })
})
