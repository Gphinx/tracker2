import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, TrendingUp, Download, AlertCircle } from 'lucide-react';
import { TimeEntry, ExportPeriod } from '@/types';

interface DashboardProps {
  entries: TimeEntry[];
  activeEntry: TimeEntry | null;
  theme: 'light' | 'dark';
}

const EXPORT_PERIODS: ExportPeriod[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' }
];

export function Dashboard({ entries, activeEntry, theme }: DashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ExportPeriod['value']>('today');

  const filteredEntries = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (selectedPeriod) {
      case 'today':
        return entries.filter(entry => entry.startTime >= startOfDay);
      case 'week':
        return entries.filter(entry => entry.startTime >= startOfWeek);
      case 'month':
        return entries.filter(entry => entry.startTime >= startOfMonth);
      default:
        return entries;
    }
  }, [entries, selectedPeriod]);

  const stats = useMemo(() => {
    const completedEntries = filteredEntries.filter(entry => entry.endTime);
    
    let prodDirectTime = 0;
    let prodIndirectTime = 0;
    let nonProdTime = 0;

    completedEntries.forEach(entry => {
      const duration = entry.totalTime || 0;
      switch (entry.taskType) {
        case 'Prod Direct':
          prodDirectTime += duration;
          break;
        case 'Prod Indirect':
          prodIndirectTime += duration;
          break;
        case 'Non-Prod':
          nonProdTime += duration;
          break;
      }
    });

    const totalTime = prodDirectTime + prodIndirectTime + nonProdTime;
    const totalProdTime = prodDirectTime + prodIndirectTime;

    return {
      totalTime,
      prodDirectTime,
      prodIndirectTime,
      nonProdTime,
      totalProdTime,
      completedSessions: completedEntries.length,
      prodDirectPercentage: totalTime > 0 ? (prodDirectTime / totalTime) * 100 : 0,
      prodIndirectPercentage: totalTime > 0 ? (prodIndirectTime / totalTime) * 100 : 0,
      nonProdPercentage: totalTime > 0 ? (nonProdTime / totalTime) * 100 : 0,
      // Add decimal values
      prodDirectDecimal: totalTime > 0 ? (prodDirectTime / totalTime) : 0,
      prodIndirectDecimal: totalTime > 0 ? (prodIndirectTime / totalTime) : 0,
      nonProdDecimal: totalTime > 0 ? (nonProdTime / totalTime) : 0
    };
  }, [filteredEntries]);

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleExport = () => {
    const csvContent = [
      ['Case ID', 'Task', 'Jurisdiction', 'Start Time', 'End Time', 'Total Time', 'Task Type'].join(','),
      ...filteredEntries.map(entry => [
        entry.caseId || '',
        entry.task,
        entry.jurisdiction,
        entry.startTime.toLocaleString(),
        entry.endTime?.toLocaleString() || 'Active',
        entry.totalTime ? formatTime(entry.totalTime) : 'Active',
        entry.taskType
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-log-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Analytics Dashboard
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Track your productivity and time distribution
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value: ExportPeriod['value']) => setSelectedPeriod(value)}>
            <SelectTrigger className={`w-32 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
              {EXPORT_PERIODS.map((period) => (
                <SelectItem 
                  key={period.value} 
                  value={period.value}
                  className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}
                >
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Active Session Alert */}
      {activeEntry && (
        <Card className={`border-orange-200 bg-orange-50 ${theme === 'dark' ? 'dark:border-orange-800 dark:bg-orange-900/20' : ''}`}>
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-orange-300' : 'text-orange-800'}`}>
                Active Session Running
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                {activeEntry.task} - Started at {activeEntry.startTime.toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
              Total Time
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : ''}`}>
              {formatTime(stats.totalTime)}
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
              {stats.completedSessions} sessions completed
            </p>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
              Prod Direct
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-green-600 ${theme === 'dark' ? 'text-green-400' : ''}`}>
              {formatTime(stats.prodDirectTime)}
            </div>
            <Progress 
              value={stats.prodDirectPercentage} 
              className="mt-2"
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
              {stats.prodDirectDecimal.toFixed(3)} of total time
            </p>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
              Prod Indirect
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-blue-600 ${theme === 'dark' ? 'text-blue-400' : ''}`}>
              {formatTime(stats.prodIndirectTime)}
            </div>
            <Progress 
              value={stats.prodIndirectPercentage} 
              className="mt-2"
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
              {stats.prodIndirectDecimal.toFixed(3)} of total time
            </p>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
              Non-Productive
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-orange-600 ${theme === 'dark' ? 'text-orange-400' : ''}`}>
              {formatTime(stats.nonProdTime)}
            </div>
            <Progress 
              value={stats.nonProdPercentage} 
              className="mt-2"
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
              {stats.nonProdDecimal.toFixed(3)} of total time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution Chart */}
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
            Time Distribution
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-gray-300' : ''}>
            Visual breakdown of your time allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                Productive Time ({formatTime(stats.totalProdTime)})
              </span>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                {((stats.totalProdTime / (stats.totalTime || 1))).toFixed(3)}
              </span>
            </div>
            <Progress 
              value={(stats.totalProdTime / (stats.totalTime || 1)) * 100} 
              className="h-3"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-2"></div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                  Prod Direct
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {formatTime(stats.prodDirectTime)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {stats.prodDirectDecimal.toFixed(3)}
                </p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-2"></div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                  Prod Indirect
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {formatTime(stats.prodIndirectTime)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {stats.prodIndirectDecimal.toFixed(3)}
                </p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-orange-500 rounded mx-auto mb-2"></div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                  Non-Productive
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {formatTime(stats.nonProdTime)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {stats.nonProdDecimal.toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
