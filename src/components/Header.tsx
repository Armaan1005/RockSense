
'use client';

import { MountainSnow, PanelLeftOpen } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
    isMobile?: boolean;
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMobile, onMenuClick }) => {
  return (
    <header className="flex h-16 items-center border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 z-10 shrink-0">
      <div className="flex items-center gap-2">
        <MountainSnow className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tighter">SnowTrace</h1>
      </div>
      <p className="hidden md:block ml-4 text-sm text-muted-foreground">
        AI-Guided Avalanche Rescue Routes in Seconds
      </p>
       {isMobile && (
        <div className="ml-auto">
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <PanelLeftOpen className="h-6 w-6" />
            <span className="sr-only">Open Mission Control</span>
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
