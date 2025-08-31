
"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ChartData } from "@/types"

interface RiskTrendChartProps {
    data: ChartData[];
}

export default function RiskTrendChart({ data }: RiskTrendChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-[250px] w-full flex items-center justify-center text-sm text-muted-foreground">
                <p>No data available to display chart. Load a dataset to see the trend.</p>
            </div>
        )
    }

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            color: 'hsl(var(--foreground))'
                        }}
                    />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <Line type="monotone" dataKey="riskScore" name="Risk Score (%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
