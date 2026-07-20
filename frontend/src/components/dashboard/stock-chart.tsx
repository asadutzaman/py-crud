import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { Product } from '@/lib/api'

const LOW_STOCK_THRESHOLD = 5

const chartConfig = {
  quantity: {
    label: 'Quantity',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

function truncate(name: string, max = 14) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

interface StockChartProps {
  products: Product[]
}

export function StockChart({ products }: StockChartProps) {
  const data = products.map((p) => ({
    name: truncate(p.name),
    fullName: p.name,
    quantity: p.quantity,
    lowStock: p.quantity < LOW_STOCK_THRESHOLD,
  }))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px]" style={{ backgroundColor: 'var(--primary)' }} />
          In stock
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] bg-destructive" />
          Low stock (&lt;{LOW_STOCK_THRESHOLD})
        </span>
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
        <BarChart data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelKey="fullName"
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName}
              />
            }
          />
          <Bar
            dataKey="quantity"
            radius={[4, 4, 0, 0]}
            fill="var(--primary)"
            shape={(props: any) => {
              const { fill, x, y, width, height, payload } = props
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={4}
                  fill={payload.lowStock ? 'var(--destructive)' : fill}
                />
              )
            }}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
