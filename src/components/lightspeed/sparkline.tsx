'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  className?: string
}

// Mini graphique de tendance (ligne simplifiée sans axes)
export function Sparkline({
  data,
  width = 60,
  height = 20,
  stroke = 'currentColor',
  fill,
  className,
}: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 2) - 1
    return [x, y] as const
  })

  const pathD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const areaD = `${pathD} L${width},${height} L0,${height} Z`
  const isUp = data[data.length - 1] >= data[0]

  return (
    <svg
      width={width}
      height={height}
      className={cn('inline-block', className)}
      preserveAspectRatio="none"
    >
      {fill && <path d={areaD} fill={fill} opacity={0.15} />}
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isUp ? '' : 'opacity-80'}
      />
      {/* Point final */}
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r={1.5}
        fill={stroke}
      />
    </svg>
  )
}
