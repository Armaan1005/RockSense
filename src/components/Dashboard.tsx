"use client";

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

const ClientDashboard = dynamic(() => import('@/components/ClientDashboard'), {
  ssr: false,
  loading: () => <div className="h-dvh w-dvh bg-muted flex items-center justify-center p-4"><Skeleton className="w-full h-full" /></div>
});

export default function Dashboard() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-dvh w-dvh bg-muted flex items-center justify-center p-4"><Skeleton className="w-full h-full" /></div>;
  }

  return <ClientDashboard />;
}
