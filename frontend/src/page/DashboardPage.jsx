import { useState } from 'react';
import Navbar from "../components/Navbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Activity, RefreshCw, TrendingUp, TrendingDown, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import MonitorCard from "../components/MonitorCard";
import AddMonitorDialog from "../components/AddMonitorDialog";

// Dummy monitors data
const dummyMonitors = [
  { id: 1, name: "API Server", url: "https://api.example.com", status: "up", response_time: 45, type: "http" },
  { id: 2, name: "Database", url: "db.example.com", status: "up", response_time: 120, type: "dns" },
  { id: 3, name: "Web Server", url: "https://example.com", status: "up", response_time: 200, type: "http" },
  { id: 4, name: "Mail Server", url: "mail.example.com", status: "down", response_time: 0, type: "dns" },
  { id: 5, name: "Backup Server", url: "8.8.8.8", status: "slow", response_time: 450, type: "icmp" },
];

function DashboardPage({ theme, setTheme }) {
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const monitors = dummyMonitors;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this monitor?')) {
      alert('Monitor deleted (dummy action)');
    }
  };

  // Stats calculation
  const stats = {
    total: monitors.length,
    up: monitors.filter(m => m.status === 'up').length,
    down: monitors.filter(m => m.status === 'down').length,
    slow: monitors.filter(m => m.status === 'slow').length,
    avgResponseTime: Math.round(monitors.reduce((acc, m) => acc + (m.response_time || 0), 0) / monitors.length),
  };

  stats.issues = stats.down + stats.slow;

  const uptime = ((stats.up / stats.total) * 100).toFixed(1);
  const uptimePercent = (stats.up / stats.total) * 100;
  const issuesPercent = (stats.issues / stats.total) * 100;

  const computePercentile = (arr, p) => {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    const weight = idx - lower;
    return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
  };

  const responseTimes = monitors.map(m => typeof m.response_time === 'number' ? m.response_time : 0).filter(x => x > 0);
  stats.p95Response = computePercentile(responseTimes, 95) || 0;

  const maxLatency = 2000;
  const latencyNormalized = Math.max(0, Math.min(1, 1 - (stats.p95Response / maxLatency)));
  const weights = { uptime: 0.5, issues: 0.3, latency: 0.2 };
  const healthRaw = (
    (uptimePercent / 100) * weights.uptime
    + (1 - (issuesPercent / 100)) * weights.issues
    + latencyNormalized * weights.latency
  );
  stats.healthScore = Math.round(healthRaw * 100);

  const getFilteredMonitors = () => {
    switch(activeTab) {
      case 'up':
        return monitors.filter(m => m.status === 'up');
      case 'down':
        return monitors.filter(m => m.status === 'down');
      case 'slow':
        return monitors.filter(m => m.status === 'slow');
      default:
        return monitors;
    }
  };

  const filteredMonitors = getFilteredMonitors();

  return (
    <div className="min-h-screen bg-background">
      <Navbar theme={theme} setTheme={setTheme} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
    
    <div className='pt-5 px-12 pb-5'>
        <h1 className='text-3xl font-bold'>Hello, Username !</h1>
    </div>
      {/* Stats Section */}
      {monitors.length > 0 && (
        <div className="border bg-muted/30 bg-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Monitors</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Operational</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.up}</p>
                    <Progress value={(stats.up / stats.total) * 100} className="mt-2 h-1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Down</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.down}</p>
                    <Progress value={(stats.down / stats.total) * 100} className="mt-2 h-1.5 bg-red-100 dark:bg-red-950 [&>div]:bg-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Uptime</p>
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-3xl font-bold">{uptime}%</p>
                      {uptime >= 99 ? (
                        <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <Progress value={parseFloat(uptime)} className="mt-2 h-1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Health Score</p>
                    <div className="flex items-center justify-center gap-1">
                      <p className={`text-3xl font-bold ${stats.healthScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : stats.healthScore >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{stats.healthScore}</p>
                      <p className="text-sm ml-1 align-baseline">/100</p>
                    </div>
                    <div className="mt-2">
                      <Progress value={stats.healthScore || 0} className="h-1.5" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{`${uptimePercent.toFixed(1)}% uptime · ${stats.p95Response}ms P95 · ${stats.issues} issues`}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Health Score = 50% uptime + 30% issue count + 20% latency (P95)
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {monitors.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                  <Activity className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">No Monitors Yet</h2>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start monitoring your websites and services by adding your first monitor.
                </p>
                <div className="flex justify-center">
                  <AddMonitorDialog />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-4 bg-gray-200">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  All
                  <Badge variant="secondary" className="ml-1">{stats.total}</Badge>
                </TabsTrigger>
                <TabsTrigger value="up" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Up
                  <Badge variant="secondary" className="ml-1 bg-emerald-100 dark:bg-emerald-950">{stats.up}</Badge>
                </TabsTrigger>
                <TabsTrigger value="slow" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Slow
                  <Badge variant="secondary" className="ml-1 bg-amber-100 dark:bg-amber-950">{stats.slow}</Badge>
                </TabsTrigger>
                <TabsTrigger value="down" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Down
                  <Badge variant="secondary" className="ml-1 bg-red-100 dark:bg-red-950">{stats.down}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-6">
              {filteredMonitors.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">No monitors in this category</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {filteredMonitors.map((monitor) => (
                    <MonitorCard 
                      key={monitor.id} 
                      monitor={monitor} 
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
