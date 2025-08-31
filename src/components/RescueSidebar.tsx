'use client';

import * as React from 'react';
import {
  TowerControl,
  Crosshair,
  AlertTriangle,
  Cloud,
  BrainCircuit,
  X,
  Undo2,
  Mountain,
  Map,
  Info,
  Loader2,
  HardHat,
  Camera,
  FileImage,
  Database,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { PlacingMode, RiskZone, MapTypeId, SlopeMaterial, AnalyzeRockFaceOutput, DatasetRow } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { RISK_COLORS } from './ClientDashboard';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import RiskTrendChart from './RiskTrendChart';

interface RescueSidebarProps {
  placingMode: PlacingMode;
  setPlacingMode: (mode: PlacingMode) => void;
  slopeAngle: string;
  setSlopeAngle: (value: string) => void;
  slopeMaterial: SlopeMaterial;
  setSlopeMaterial: (value: SlopeMaterial) => void;
  environmentalFactors: string;
  setEnvironmentalFactors: (value: string) => void;
  mapTypeId: MapTypeId;
  setMapTypeId: (value: MapTypeId) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  riskZones: RiskZone[];
  onClear: () => void;
  onUndo: () => void;
  canUndo: boolean;
  riskPointCount: number;
  isBaseSet: boolean;
  isUnstableZoneSet: boolean;
  analysisSummary: string | null;
  isMobile?: boolean;
  rockFaceImage: File | null;
  setRockFaceImage: (file: File | null) => void;
  onInspect: () => void;
  isInspecting: boolean;
  inspectionResult: AnalyzeRockFaceOutput | null;
  datasetRows: DatasetRow[];
  onFetchDataset: () => void;
  isFetchingData: boolean;
  totalRecords: number;
}

const RescueSidebar: React.FC<RescueSidebarProps> = ({
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
  onAnalyze,
  isAnalyzing,
  riskZones,
  onClear,
  onUndo,
  canUndo,
  riskPointCount,
  isBaseSet,
  isUnstableZoneSet,
  analysisSummary,
  isMobile,
  rockFaceImage,
  setRockFaceImage,
  onInspect,
  isInspecting,
  inspectionResult,
  datasetRows,
  onFetchDataset,
  isFetchingData,
  totalRecords,
}) => {
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRockFaceImage(file);
    }
  };
  
  // Find the highest risk zone for the summary cards
  const highestRiskZone = riskZones.length > 0
    ? riskZones.sort((a, b) => {
        const order = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (order[b.riskLevel] || 0) - (order[a.riskLevel] || 0);
      })[0]
    : null;
    
  const highRiskCount = riskZones.filter(z => z.riskLevel === 'High').length;
  const mediumRiskCount = riskZones.filter(z => z.riskLevel === 'Medium').length;
  const lowRiskCount = riskZones.filter(z => z.riskLevel === 'Low').length;
  const totalRiskZones = riskZones.length;


  return (
    <aside className="w-full md:w-[380px] flex flex-col border-l bg-background/80 backdrop-blur-sm h-full">
       <div className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="analysis" className="flex-1 flex flex-col min-h-0">
              <div className="p-4 pb-0 shrink-0">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>
              </div>
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <TabsContent value="analysis" className="mt-0">
                    <div className={cn("p-4 space-y-4", isMobile && "pt-12")}>
                      <div>
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold">Site Analysis Control</h2>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-4 w-4 text-foreground" />
                                <span className="sr-only">How to use</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="text-sm w-[320px] md:w-auto">
                              <h4 className="font-semibold mb-2">How to Predict Risk</h4>
                              <ol className="list-decimal list-inside space-y-2">
                                <li>
                                  <strong>Set Base:</strong> Click "Set Monitoring Base" and then click on the map to place your headquarters.
                                </li>
                                <li>
                                  <strong>Add High-Risk Points:</strong> Click "Add High-Risk Point" and click on the map for each point of concern.
                                </li>
                                <li>
                                  <strong>Define Unstable Zone:</strong> Click "Define Unstable Zone" and click at least three points on the map to create a polygon.
                                </li>
                                <li>
                                  <strong>Configure:</strong> Adjust slope geometry, material, environmental factors and map type.
                                </li>
                                <li>
                                  <strong>Analyze:</strong> Click "Analyze Risk" to see the AI prediction.
                                </li>
                                <li>
                                  <strong>Visual Inspection:</strong> Upload an image of a rock face for AI-powered crack detection.
                                </li>
                              </ol>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-sm text-muted-foreground">Configure and manage your geotechnical analysis.</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant={placingMode === 'base' ? 'secondary' : 'outline'} onClick={() => setPlacingMode('base')}><TowerControl className="mr-2"/> Set Monitoring Base</Button>
                        <Button variant={placingMode === 'risk-point' ? 'secondary' : 'outline'} onClick={() => setPlacingMode('risk-point')}><Crosshair className="mr-2"/> Add High-Risk Point</Button>
                        <Button variant={placingMode === 'unstable-zone' ? 'secondary' : 'outline'} onClick={() => setPlacingMode('unstable-zone')}><AlertTriangle className="mr-2"/> Define Unstable Zone</Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
                          {placingMode ? `Click on the map to place the ${placingMode}. For risk points, click multiple times. For the unstable zone, click to form a polygon.` : "Select an action above to start marking the map."}
                      </p>

                      <Separator/>

                      <Accordion type="multiple" defaultValue={['geotechnical-params']} className="w-full">
                        <AccordionItem value="geotechnical-params">
                          <AccordionTrigger className="text-md font-semibold">Geotechnical Parameters</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div>
                                <label className="text-sm font-medium" htmlFor="slope-angle">Slope Angle (°)</label>
                                <Input id="slope-angle" value={slopeAngle} onChange={(e) => setSlopeAngle(e.target.value)} placeholder="e.g., 45" />
                              </div>
                              <div>
                                <label className="text-sm font-medium" htmlFor="slope-material">Slope Material</label>
                                <Select value={slopeMaterial} onValueChange={(v) => setSlopeMaterial(v as SlopeMaterial)}>
                                  <SelectTrigger id="slope-material"><Mountain className="mr-2"/>{slopeMaterial.charAt(0).toUpperCase() + slopeMaterial.slice(1)}</SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="granite">Granite</SelectItem>
                                    <SelectItem value="limestone">Limestone</SelectItem>
                                    <SelectItem value="sandstone">Sandstone</SelectItem>
                                    <SelectItem value="shale">Shale</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium" htmlFor="env-factors">Environment</label>
                                <Select value={environmentalFactors} onValueChange={setEnvironmentalFactors}>
                                  <SelectTrigger id="env-factors"><Cloud className="mr-2"/>{environmentalFactors}</SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Clear">Clear</SelectItem>
                                    <SelectItem value="Light Rainfall">Light Rainfall</SelectItem>
                                    <SelectItem value="Heavy Rainfall">Heavy Rainfall</SelectItem>
                                    <SelectItem value="Seismic Activity">Seismic Activity</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium" htmlFor="map-type">Map Type</label>
                                <Select value={mapTypeId} onValueChange={(v) => setMapTypeId(v as MapTypeId)}>
                                  <SelectTrigger id="map-type"><Map className="mr-2"/>{mapTypeId.charAt(0).toUpperCase() + mapTypeId.slice(1)}</SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="terrain">Terrain</SelectItem>
                                    <SelectItem value="roadmap">Roadmap</SelectItem>
                                    <SelectItem value="satellite">Satellite</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="visual-inspection">
                          <AccordionTrigger className="text-md font-semibold">Visual Inspection</AccordionTrigger>
                          <AccordionContent>
                            <Card className="mt-2">
                                <CardContent className="pt-6 space-y-4">
                                    <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                                    <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                        <FileImage className="mr-2" />
                                        {rockFaceImage ? rockFaceImage.name : "Select Image"}
                                    </Button>
                                    <Button onClick={onInspect} disabled={isInspecting || !rockFaceImage} className="w-full">
                                        {isInspecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2" />}
                                        {isInspecting ? "Analyzing..." : "Analyze Rock Face"}
                                    </Button>
                                </CardContent>
                            </Card>

                            {isInspecting && (
                              <Card className="mt-4">
                                  <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                      <span>Running visual analysis...</span>
                                  </CardContent>
                              </Card>
                            )}

                            {inspectionResult && !isInspecting && (
                                <Card className="mt-4">
                                    <CardHeader>
                                        <CardTitle>Inspection Result</CardTitle>
                                        <CardDescription>Stability Rating: <Badge variant={inspectionResult.stabilityRating === 'Unstable' || inspectionResult.stabilityRating === 'Potentially Unstable' ? 'destructive' : 'default'}>{inspectionResult.stabilityRating}</Badge></CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <p><strong>Crack Detection:</strong> {inspectionResult.crackAnalysis.detected ? `Found ${inspectionResult.crackAnalysis.count} cracks.` : 'No significant cracks detected.'}</p>
                                        <p><strong>Severity:</strong> <Badge variant={inspectionResult.crackAnalysis.severity === 'High' ? 'destructive' : (inspectionResult.crackAnalysis.severity === 'Medium' ? 'secondary' : 'default')}>{inspectionResult.crackAnalysis.severity}</Badge></p>
                                        <p><strong>Description:</strong> {inspectionResult.crackAnalysis.description}</p>
                                        <p><strong>Additional Notes:</strong> {inspectionResult.additionalObservations}</p>
                                    </CardContent>
                                </Card>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="detailed-analysis">
                          <AccordionTrigger className="text-md font-semibold">Detailed Analysis</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium" htmlFor="water-content">Water Content (%)</label>
                                        <Input id="water-content" placeholder="e.g., 15" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium" htmlFor="rock-density">Rock Density (kg/m³)</label>
                                        <Input id="rock-density" placeholder="e.g., 2700" />
                                    </div>
                                </div>
                                <Button disabled className="w-full">
                                    <BrainCircuit className="mr-2" />
                                    Run Detailed Simulation
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">More detailed analysis coming soon.</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="dataset-explorer">
                          <AccordionTrigger className="text-md font-semibold">Dataset Explorer</AccordionTrigger>
                          <AccordionContent>
                              <Card className="mt-2">
                                  <CardContent className="pt-6 space-y-4">
                                      <Button onClick={onFetchDataset} disabled={isFetchingData} className="w-full">
                                          {isFetchingData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2" />}
                                          {isFetchingData ? "Loading..." : "Load Dataset"}
                                      </Button>
                                      {datasetRows.length > 0 && (
                                          <div className="max-h-64 overflow-y-auto">
                                              <Table>
                                                  <TableHeader>
                                                      <TableRow>
                                                          <TableHead>Cohesion</TableHead>
                                                          <TableHead>Friction</TableHead>
                                                          <TableHead>Unit Weight</TableHead>
                                                      </TableRow>
                                                  </TableHeader>
                                                  <TableBody>
                                                      {datasetRows.map((item, index) => (
                                                          <TableRow key={index}>
                                                          <TableCell>{item.row?.features?.[0]?.value}</TableCell>
                                                          <TableCell>{item.row?.features?.[1]?.value}</TableCell>
                                                          <TableCell>{item.row?.features?.[2]?.value}</TableCell>
                                                          </TableRow>
                                                      ))}
                                                  </TableBody>
                                              </Table>
                                          </div>
                                      )}
                                      {isFetchingData && <p className="text-sm text-center text-muted-foreground">Fetching data from Hugging Face...</p>}
                                  </CardContent>
                              </Card>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <Separator />

                      <div>
                        <h3 className="text-md font-semibold mb-2">Risk Prediction</h3>
                        {riskZones.length > 0 && (
                          <Accordion type="single" collapsible defaultValue="item-0">
                            {riskZones.map((zone, index) => (
                              <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                  <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: RISK_COLORS[zone.riskLevel] || '#fff'}}></span>
                                    <span className="font-semibold">{zone.zoneName}</span>
                                    <Badge variant={zone.riskLevel === 'High' ? 'destructive' : (zone.riskLevel === 'Medium' ? 'secondary' : 'default')}>{zone.riskLevel} Risk</Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                  <p className="text-sm">{zone.analysis}</p>
                                  <div className='flex flex-col gap-2 text-sm'>
                                    <div className='flex items-center gap-2 text-muted-foreground'>
                                        <HardHat className='w-4 h-4' />
                                        <span>Recommendation:</span>
                                        <span className='font-semibold text-foreground'>{zone.recommendation}</span>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        )}
                        {isAnalyzing && (
                          <Card>
                            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                              <p>Analyzing risk factors...</p>
                            </CardContent>
                          </Card>
                        )}
                        {!isAnalyzing && riskZones.length === 0 && (
                            <p className="text-sm text-muted-foreground">No prediction generated yet.</p>
                        )}
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-md font-semibold mb-2">Analysis Summary</h3>
                        {analysisSummary && !isAnalyzing && (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground">{analysisSummary}</p>
                                </CardContent>
                            </Card>
                        )}
                        {!analysisSummary && !isAnalyzing && (
                            <p className="text-sm text-muted-foreground">No analysis performed yet.</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="reports" className="mt-0">
                    <div className="p-4 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Dashboard</h2>
                            <p className="text-sm text-muted-foreground">Real-time monitoring of rockfall risk in pit mining operations.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                           <Card className="border-l-4 border-orange-400">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium flex justify-between items-center">Current Risk Level <AlertTriangle className="w-4 h-4 text-muted-foreground" /></CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{highestRiskZone ? `${highestRiskZone.riskLevel} Risk` : 'N/A'}</p>
                                    {highestRiskZone && <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800">{highestRiskZone.zoneName}</Badge>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium flex justify-between items-center">Risk Probability <TrendingUp className="w-4 h-4 text-muted-foreground" /></CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{highestRiskZone ? {High: '72%', Medium: '48%', Low: '15%'}[highestRiskZone.riskLevel] : 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground">Based on current slope conditions</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium flex justify-between items-center">Safety Recommendation <HardHat className="w-4 h-4 text-muted-foreground" /></CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold text-sm">{highestRiskZone?.recommendation || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground">Immediate action recommended</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Separator />
                         <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Database /> Total Records</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{totalRecords}</p>
                                    <p className="text-xs text-muted-foreground">From Hugging Face</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><ShieldAlert /> High Risk Cases</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{highRiskCount}</p>
                                    <p className="text-xs text-muted-foreground">{totalRiskZones > 0 ? `${Math.round((highRiskCount / totalRiskZones) * 100)}% of total` : 'N/A'}</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Shield /> Medium Risk Cases</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{mediumRiskCount}</p>
                                    <p className="text-xs text-muted-foreground">{totalRiskZones > 0 ? `${Math.round((mediumRiskCount / totalRiskZones) * 100)}% of total` : 'N/A'}</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><ShieldCheck /> Low Risk Cases</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{lowRiskCount}</p>
                                    <p className="text-xs text-muted-foreground">{totalRiskZones > 0 ? `${Math.round((lowRiskCount / totalRiskZones) * 100)}% of total` : 'N/A'}</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Separator />
                         <Card>
                            <CardHeader>
                                <CardTitle>Risk Trend Analysis</CardTitle>
                                <CardDescription>Monthly risk score progression over the past 8 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RiskTrendChart />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                </ScrollArea>
              </div>
          </Tabs>
       </div>
      
      <div className="p-4 border-t space-y-2 shrink-0">
         <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Base Set: <Badge variant={isBaseSet ? "default" : "secondary"}>{isBaseSet ? "Yes" : "No"}</Badge></span>
            <span>Risk Pts: <Badge variant={riskPointCount > 0 ? "default" : "secondary"}>{riskPointCount}</Badge></span>
            <span>Zone Defined: <Badge variant={isUnstableZoneSet ? "default" : "secondary"}>{isUnstableZoneSet ? "Yes" : "No"}</Badge></span>
        </div>
        <div className="grid grid-cols-1 gap-2">
            <Button onClick={onAnalyze} disabled={isAnalyzing || !isUnstableZoneSet || riskPointCount === 0} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2"/>
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze Risk"}
            </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <Button onClick={onUndo} variant="outline" disabled={!canUndo}>
                <Undo2 className="mr-2"/> Undo
            </Button>
            <Button onClick={onClear} variant="outline">
                <X className="mr-2"/> Clear
            </Button>
        </div>
      </div>
    </aside>
  );
};

export default RescueSidebar;
