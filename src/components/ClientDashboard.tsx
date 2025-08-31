
"use client";

import * as React from 'react';
import type { LatLngLiteral, PlacingMode, RiskZone, MapTypeId, SlopeMaterial, AnalyzeRockFaceOutput, DatasetRow, PredictRiskZonesOutput, ChartData } from '@/types';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import RescueSidebar from '@/components/RescueSidebar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { predictRiskZonesAction, analyzeRockFaceAction, generateReportCsvAction } from '@/lib/actions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from './ui/sheet';
import Papa from 'papaparse';
import { sampleDataset } from '@/lib/sample-data';

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

  const [displacement, setDisplacement] = React.useState('');
  const [strain, setStrain] = React.useState('');
  const [porePressure, setPorePressure] = React.useState('');

  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<PredictRiskZonesOutput | null>(null);
  
  const [isInspecting, setIsInspecting] = React.useState(false);
  const [rockFaceImage, setRockFaceImage] = React.useState<File | null>(null);
  const [inspectionResult, setInspectionResult] = React.useState<AnalyzeRockFaceOutput | null>(null);

  const [datasetRows, setDatasetRows] = React.useState<DatasetRow[]>([]);
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);


  const handleLoadSampleData = () => {
    setDatasetRows(sampleDataset);
    toast({ title: 'Success', description: 'Sample dataset loaded successfully.' });
  };

  const handleFileUpload = (file: File) => {
    if (!file) {
      toast({ title: 'Error', description: 'No file selected.', variant: 'destructive' });
      return;
    }
    setIsParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Assuming the CSV has 'cohesion', 'friction', 'unit_weight' columns
        const parsedRows: DatasetRow[] = (results.data as any[]).map((row, index) => ({
            row_idx: index,
            row: {
                features: [
                    { feature_idx: 0, name: 'cohesion', value: row.cohesion || 'N/A' },
                    { feature_idx: 1, name: 'friction', value: row.friction || 'N/A' },
                    { feature_idx: 2, name: 'unit_weight', value: row.unit_weight || 'N/A' },
                ]
            },
            truncated_cells: []
        }));
        setDatasetRows(parsedRows);
        setIsParsing(false);
        toast({ title: 'Success', description: 'CSV file uploaded and parsed successfully.' });
      },
      error: (error) => {
        setIsParsing(false);
        toast({ title: 'Error', description: `CSV parsing error: ${error.message}`, variant: 'destructive' });
      }
    });
  };

   React.useEffect(() => {
    if (datasetRows.length > 0) {
        // Simulate generating chart data from the dataset
        const newChartData: ChartData[] = datasetRows.slice(0, 12).map((row, index) => {
            const friction = row.row?.features.find(f => f.name === 'friction')?.value || 0;
            // Simple logic to create some variance in the chart
            const riskScore = Math.min(100, Math.round(parseFloat(friction) * 1.5 + 20 + (Math.random() * 10)));
            const month = new Date(2024, index, 1).toLocaleString('default', { month: 'short', year: '2-digit' });
            return { month: month.replace(' ', ''), riskScore };
        });
        setChartData(newChartData);
    }
  }, [datasetRows]);


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
    setAnalysisResult(null);

    try {
      const result = await predictRiskZonesAction({
        slopeGeometry: `Angle: ${slopeAngle} degrees`,
        slopeMaterial: slopeMaterial,
        environmentalFactors: environmentalFactors,
        unstableZone: unstableZone.map(p => `${p.lat},${p.lng}`),
        highRiskPoints: highRiskPoints.map(p => `${p.lat},${p.lng}`),
        displacement,
        strain,
        porePressure,
      });

      setAnalysisResult(result);
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
  
  const handleExportReport = async () => {
    if (!analysisResult) {
       toast({ title: 'No Data', description: 'Please run an analysis before exporting.', variant: 'destructive' });
       return;
    }
    setIsExporting(true);
    try {
      const { csvData } = await generateReportCsvAction(analysisResult);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "RockSense_Report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast({ title: 'Success', description: 'Report exported successfully.' });
    } catch (error) {
       console.error("Export Error:", error);
       toast({ title: 'Export Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
       setIsExporting(false);
    }
};

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
    setAnalysisResult(null);
    setPlacingMode(null);
    setLastActionStack([]);
    setRockFaceImage(null);
    setInspectionResult(null);
    setDatasetRows([]);
    setChartData([]);
    setDisplacement('');
    setStrain('');
    setPorePressure('');
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
      displacement,
      setDisplacement,
      strain,
      setStrain,
      porePressure,
      setPorePressure,
      onAnalyze: handleAnalyzeRisk,
      isAnalyzing,
      riskZones: analysisResult?.riskZones ?? [],
      analysisSummary: analysisResult?.summary ?? null,
      onClear: clearAll,
      onUndo: handleUndo,
      canUndo: lastActionStack.length > 0,
      riskPointCount: highRiskPoints.length,
      isBaseSet: !!baseLocation,
      isUnstableZoneSet: unstableZone.length > 2,
      isMobile,
      rockFaceImage,
      setRockFaceImage,
      onInspect: handleInspectRockFace,
      isInspecting,
      inspectionResult,
      datasetRows,
      onLoadSampleData: handleLoadSampleData,
      onFileUpload: handleFileUpload,
      isParsing,
      totalRecords: datasetRows.length,
      onExport: handleExportReport,
      isExporting,
      hasAnalysisData: !!analysisResult,
      chartData,
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
            riskZones={analysisResult?.riskZones ?? []}
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

    