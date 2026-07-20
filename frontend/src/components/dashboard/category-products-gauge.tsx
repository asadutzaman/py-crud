import { Label, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'

import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { CategoryBreakdown } from '@/lib/api'

// Validated categorical palette (blue, green, magenta, yellow) — distinct
// light/dark steps defined on --chart-1..4 in index.css.
const RING_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']
const OTHER_COLOR = 'var(--muted-foreground)'
const MAX_SEGMENTS = RING_COLORS.length + 1

const chartConfig = {} satisfies ChartConfig

interface CategoryProductsGaugeProps {
  categories: CategoryBreakdown[]
  totalProducts: number
}

export function CategoryProductsGauge({ categories, totalProducts }: CategoryProductsGaugeProps) {
  if (totalProducts === 0) {
    return <p className="text-sm text-muted-foreground">No products yet.</p>
  }

  const shown = categories.slice(0, MAX_SEGMENTS - 1)
  const rest = categories.slice(MAX_SEGMENTS - 1)
  const otherCount = rest.reduce((sum, c) => sum + c.total_products, 0)

  const segments = [
    ...shown.map((c, i) => ({
      key: `cat_${c.id ?? 'none'}`,
      name: c.name,
      total_products: c.total_products,
      fill: RING_COLORS[i % RING_COLORS.length],
    })),
    ...(otherCount > 0
      ? [{ key: 'other', name: 'Other', total_products: otherCount, fill: OTHER_COLOR }]
      : []),
  ]

  const data = [Object.fromEntries(segments.map((s) => [s.key, s.total_products]))]

  return (
    <div className="flex flex-col items-center gap-3">
      <ChartContainer config={chartConfig} className="mx-auto h-52 w-full max-w-80">
        <RadialBarChart
          data={data}
          innerRadius="45%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          cy="70%"
        >
          <PolarAngleAxis type="number" domain={[0, totalProducts]} tick={false} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 20} className="fill-foreground text-4xl font-bold">
                      {totalProducts}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 14} className="fill-muted-foreground text-sm">
                      Products
                    </tspan>
                  </text>
                )
              }}
            />
          </PolarRadiusAxis>
          {segments.map((s, i) => (
            <RadialBar
              key={s.key}
              dataKey={s.key}
              stackId="stack"
              cornerRadius={8}
              fill={s.fill}
              className="stroke-card stroke-2"
              background={i === 0 ? { fill: 'var(--muted)' } : undefined}
            />
          ))}
        </RadialBarChart>
      </ChartContainer>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: s.fill }} />
            <span className="font-medium">{s.name}</span>
            <span className="text-muted-foreground">{s.total_products}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
