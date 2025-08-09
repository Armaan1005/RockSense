
import { Button } from '@/components/ui/button';
import { MountainSnow, BrainCircuit, Map, Crosshair } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background dark text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2">
          <MountainSnow className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tighter">SnowTrace</h1>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/dashboard"
          >
            Demo
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  AI-Guided Avalanche Rescue
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  SnowTrace leverages cutting-edge AI to generate optimal rescue routes in seconds, helping search and rescue teams save lives in treacherous terrain.
                </p>
              </div>
              <div className="space-y-2">
                <Button asChild size="lg">
                  <Link href="/dashboard">View Live Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Plan, Analyze, and Rescue Faster
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides the critical tools needed for rapid and effective avalanche rescue operations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <BrainCircuit className="mx-auto h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">AI Route Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate multiple, optimized rescue routes in seconds based on victim locations, weather, and rescue strategy.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Map className="mx-auto h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Interactive Mission Map</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize the entire operation. Place the rescue base, victim locations, and avalanche zones on a dynamic map.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Crosshair className="mx-auto h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Probability Analysis</h3>
                <p className="text-sm text-muted-foreground">
                 Leverage AI to analyze victim probability based on time, weather, and location to prioritize search areas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 SnowTrace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
