import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, History, Filter } from 'lucide-react';
import { TimeEntry } from '@/types';

interface TimeLogTableProps {
  entries: TimeEntry[];
  onDeleteEntry: (id: string) => void;
  theme: 'light' | 'dark';
}

export function TimeLogTable({ entries, onDeleteEntry, theme }: TimeLogTableProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEntries = entries.filter(entry => {
    if (filterType === 'all') return true;
    return entry.taskType === filterType;
  });

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTaskTypeBadge = (taskType: TimeEntry['taskType']) => {
    const colors = {
      'Prod Direct': 'bg-green-100 text-green-800 border-green-200',
      'Prod Indirect': 'bg-blue-100 text-blue-800 border-blue-200',
      'Non-Prod': 'bg-orange-100 text-orange-800 border-orange-200',
      'Uncategorized': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge className={`${colors[taskType]} border`}>
        {taskType}
      </Badge>
    );
  };

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
              <History className="w-6 h-6 text-indigo-600" />
              My Time Log
            </CardTitle>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Your personal time tracking history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className={`w-40 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
                <SelectItem value="all" className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}>
                  All Types
                </SelectItem>
                <SelectItem value="Prod Direct" className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}>
                  Prod Direct
                </SelectItem>
                <SelectItem value="Prod Indirect" className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}>
                  Prod Indirect
                </SelectItem>
                <SelectItem value="Non-Prod" className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}>
                  Non-Prod
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEntries.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No time entries found</p>
            <p className="text-sm">Start tracking time to see your entries here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Case ID
                  </th>
                  <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Task
                  </th>
                  <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Jurisdiction
                  </th>
                  <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Start Time
                  </th>
                  <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    End Time
                  </th>
                  <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Duration
                  </th>
                  <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Type
                  </th>
                  <th className={`text-left p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries
                  .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
                  .map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className={`p-3 font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                        {entry.caseId || '-'}
                      </td>
                      <td className={`p-3 ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                        {entry.task}
                      </td>
                      <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {entry.jurisdiction || '-'}
                      </td>
                      <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {entry.startTime.toLocaleString()}
                      </td>
                      <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {entry.endTime ? entry.endTime.toLocaleString() : 
                          <Badge className="bg-green-100 text-green-800 border-green-200 border">
                            Active
                          </Badge>
                        }
                      </td>
                      <td className={`p-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {entry.totalTime ? formatDuration(entry.totalTime) : '-'}
                      </td>
                      <td className="p-3">
                        {getTaskTypeBadge(entry.taskType)}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
