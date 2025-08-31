
"use client";

import * as React from 'react';
import type { LatLngLiteral, PlacingMode, RiskZone, MapTypeId, SlopeMaterial, AnalyzeRockFaceOutput, DatasetRow } from '@/types';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import RescueSidebar from '@/components/RescueSidebar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { predictRiskZonesAction, analyzeRockFaceAction } from '@/lib/actions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from './ui/sheet';

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center p-4"><Skeleton className="w-full h-full" /></div>
});

export const RISK_COLORS: { [key: string]: string } = {
  'Low': '#2ecc71', // Green
  'Medium': '#f1c40f', // Yellow
  'High': '#e74c3c', // Red
  'Unstable': '#9b59b6', // Purple
};

type LastAction = 'base' | 'risk-point' | 'unstable-zone' | null;

const ClientDashboard: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false);

  const [placingMode, setPlacingMode] = React.useState<PlacingMode>(null);
  const [baseLocation, setBaseLocation] = React.useState<LatLngLiteral | null>(null);
  const [highRiskPoints, setHighRiskPoints] = React.useState<LatLngLiteral[]>([]);
  const [unstableZone, setUnstableZone] = React.useState<LatLngLiteral[]>([]);
  const [lastActionStack, setLastActionStack] = React.useState<LastAction[]>([]);
  
  const [slopeAngle, setSlopeAngle] = React.useState<string>('45');
  const [slopeMaterial, setSlopeMaterial] = React.useState<SlopeMaterial>('limestone');
  const [environmentalFactors, setEnvironmentalFactors] = React.useState<string>('Heavy Rainfall');
  const [mapTypeId, setMapTypeId] = React.useState<MapTypeId>('terrain');

  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [riskZones, setRiskZones] = React.useState<RiskZone[]>([]);
  const [analysisSummary, setAnalysisSummary] = React.useState<string | null>(null);

  const [isInspecting, setIsInspecting] = React.useState(false);
  const [rockFaceImage, setRockFaceImage] = React.useState<File | null>(null);
  const [inspectionResult, setInspectionResult] = React.useState<AnalyzeRockFaceOutput | null>(null);

  const [datasetRows, setDatasetRows] = React.useState<DatasetRow[]>([]);
  const [isFetchingData, setIsFetchingData] = React.useState(false);

  const handleFetchDataset = async () => {
    setIsFetchingData(true);
    try {
      const response = await fetch("https://datasets-server.huggingface.co/rows?dataset=zhaoyiww%2FRockfall_Simulator&config=default&split=train&offset=0&length=100");
      if (!response.ok) {
        throw new Error("Failed to fetch dataset from Hugging Face.");
      }
      const data = await response.json();
      setDatasetRows(data.rows);
      toast({ title: 'Success', description: 'Dataset loaded successfully.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsFetchingData(false);
    }
  };


  const addMapPoint = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPoint = e.latLng.toJSON();
    if (placingMode === 'base') {
      setBaseLocation(newPoint);
      setPlacingMode(null);
      setLastActionStack(prev => [...prev, 'base']);
    } else if (placingMode === 'risk-point') {
      setHighRiskPoints(prev => [...prev, newPoint]);
      setLastActionStack(prev => [...prev, 'risk-point']);
    } else if (placingMode === 'unstable-zone') {
      setUnstableZone(prev => [...prev, newPoint]);
      setLastActionStack(prev => [...prev, 'unstable-zone']);
    }
  };

  const handleAnalyzeRisk = async () => {
    if (unstableZone.length < 3) {
      toast({ title: 'Missing Information', description: 'Please define an unstable zone with at least 3 points.', variant: 'destructive' });
      return;
    }
    if (highRiskPoints.length === 0) {
      toast({ title: 'Missing Information', description: 'Please add at least one high-risk point for analysis.', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    setRiskZones([]);
    setAnalysisSummary(null);

    try {
      const result = await predictRiskZonesAction({
        slopeGeometry: `Angle: ${slopeAngle} degrees`,
        slopeMaterial: slopeMaterial,
        environmentalFactors: environmentalFactors,
        unstableZone: unstableZone.map(p => `${p.lat},${p.lng}`),
        highRiskPoints: highRiskPoints.map(p => `${p.lat},${p.lng}`),
      });

      setRiskZones(result.riskZones);
      setAnalysisSummary(result.summary);
      toast({ title: 'Success', description: 'Rockfall risk analysis complete.' });

    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleInspectRockFace = async () => {
    if (!rockFaceImage) {
      toast({ title: 'Missing Image', description: 'Please select an image file to analyze.', variant: 'destructive' });
      return;
    }

    setIsInspecting(true);
    setInspectionResult(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(rockFaceImage);
        reader.onload = async () => {
            const photoDataUri = reader.result as string;
            const result = await analyzeRockFaceAction({ photoDataUri });
            setInspectionResult(result);
            toast({ title: 'Success', description: 'Rock face inspection complete.' });
            setIsInspecting(false);
        };
        reader.onerror = (error) => {
            throw new Error("Failed to read the image file.");
        }

    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
      setIsInspecting(false);
    } 
  }

  const handleUndo = () => {
    if (lastActionStack.length === 0) return;

    const lastAction = lastActionStack[lastActionStack.length - 1];

    if (lastAction === 'base') {
      setBaseLocation(null);
    } else if (lastAction === 'risk-point') {
      setHighRiskPoints(prev => prev.slice(0, -1));
    } else if (lastAction === 'unstable-zone') {
      setUnstableZone(prev => prev.slice(0, -1));
    }

    setLastActionStack(prev => prev.slice(0, -1));
  };

  const clearAll = () => {
    setBaseLocation(null);
    setHighRiskPoints([]);
    setUnstableZone([]);
    setRiskZones([]);
    setPlacingMode(null);
    setLastActionStack([]);
    setAnalysisSummary(null);
    setRockFaceImage(null);
    setInspectionResult(null);
    setDatasetRows([]);
  }
  
  const sidebarProps = {
      placingMode,
      setPlacingMode,
      slopeAngle,
      setSlopeAngle,
      slopeMaterial,
      setSlopeMaterial,
      environmentalFactors,
      setEnvironmentalFactors,
      mapTypeId,
      setMapTypeId,
      onAnalyze: handleAnalyzeRisk,
      isAnalyzing,
      riskZones,
      onClear: clearAll,
      onUndo: handleUndo,
      canUndo: lastActionStack.length > 0,
      riskPointCount: highRiskPoints.length,
      isBaseSet: !!baseLocation,
      isUnstableZoneSet: unstableZone.length > 2,
      analysisSummary,
      isMobile,
      rockFaceImage,
      setRockFaceImage,
      onInspect: handleInspectRockFace,
      isInspecting,
      inspectionResult,
      datasetRows,
      onFetchDataset: handleFetchDataset,
      isFetchingData,
      totalRecords: datasetRows.length,
  };


  return (
    <div className="flex h-dvh w-full flex-col bg-background text-foreground font-body">
      <Header isMobile={isMobile} onMenuClick={() => setMobileSheetOpen(true)} />
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="flex-1 relative h-full">
          <MapWrapper
            baseLocation={baseLocation}
            highRiskPoints={highRiskPoints}
            unstableZoneShape={unstableZone}
            riskZones={riskZones}
            onMapClick={addMapPoint}
            placingMode={placingMode}
            mapTypeId={mapTypeId}
          />
        </div>

        {isMobile ? (
             <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
                   <RescueSidebar {...sidebarProps} />
                </SheetContent>
            </Sheet>
        ) : (
           <div className="md:w-[380px] shrink-0 h-full flex flex-col">
             <RescueSidebar {...sidebarProps} />
           </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
