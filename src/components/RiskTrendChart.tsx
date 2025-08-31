"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import type { ChartData } from "@/types"

const data: ChartData[] = [
    { month: '2024-01', riskScore: 45 },
    { month: '2024-02', riskScore: 52 },
    { month: '2024-03', riskScore: 48 },
    { month: '2024-04', riskScore: 61 },
    { month: '2024-05', riskScore: 75 },
    { month: '2024-06', riskScore: 70 },
    { month: '2024-07', riskScore: 78 },
    { month: '2024-08', riskScore: 74 },
];


export default function RiskTrendChart() {
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
