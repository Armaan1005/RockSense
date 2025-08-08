'use client';

import { MountainSnow } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex h-16 items-center border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 z-10 shrink-0">
      <div className="flex items-center gap-2">
        <MountainSnow className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tighter">SnowTrace</h1>
      </div>
      <p className="hidden md:block ml-4 text-sm text-muted-foreground">
        AI-Guided Avalanche Rescue Routes in Seconds
      </p>
    </header>
  );
};

export default Header;
