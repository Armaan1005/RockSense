"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

const ClientDashboard = dynamic(() => import('@/components/ClientDashboard'), {
  ssr: false,
  loading: () => <div className="h-dvh w-dvh bg-muted flex items-center justify-center p-4"><Skeleton className="w-full h-full" /></div>
});

export default function Dashboard() {
  return <ClientDashboard />;
}
