
import { Button } from '@/components/ui/button';
import { Cpu, Map, ShieldAlert, Mountain } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background dark text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2">
          <Mountain className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tighter">RockSense</h1>
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
      <main className="flex-1 flex flex-col">
        <section className="w-full flex-1 flex items-center justify-center py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-primary">
                  AI-Powered Rockfall Prediction
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  RockSense leverages cutting-edge AI to predict rockfall hazards in open-pit mines, providing real-time alerts to enhance safety and prevent accidents.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/dashboard">View Live Demo</Link>
              </Button>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container flex flex-col items-center justify-center px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Predict, Analyze, and Secure Your Site
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides the critical tools for proactive geotechnical risk management in open-pit mines.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 sm:grid-cols-1 md:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center justify-items-center">
                <Cpu className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">ML-Powered Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  Utilize advanced machine learning models to analyze historical and real-time data for accurate rockfall prediction.
                </p>
              </div>
              <div className="grid gap-1 text-center justify-items-center">
                <Map className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Interactive Risk Map</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize geotechnical data and high-risk zones on a dynamic map. Mark unstable areas and monitor environmental factors in real-time.
                </p>
              </div>
              <div className="grid gap-1 text-center justify-items-center">
                <ShieldAlert className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Factor of Safety Analysis</h3>
                <p className="text-sm text-muted-foreground">
                 Leverage AI to perform Factor of Safety calculations and receive automatic alerts for areas that fall below safety thresholds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 RockSense. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
