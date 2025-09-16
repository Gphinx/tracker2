import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Play, Square } from 'lucide-react';
import { TimeEntry } from '@/types';

interface TimeTrackerProps {
  onAddEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  activeEntry: TimeEntry | null;
  onStopTracking: () => void;
  theme: 'light' | 'dark';
}

// Only Prod Direct and Prod Indirect tasks (Non-Prod moved to Quick Actions)
const PROD_DIRECT_TASKS = [
  'RECORDS',
  'INITIAL', 
  'MANUAL',
  'WORK ORDERS',
  'LIVE QUEUE',
  'FEDCRIM',
  'FEDCIV'
];

const PROD_INDIRECT_TASKS = [
  'TRAINING BLOCKS',
  'SCHEDULED CALIBRATION SESSION/REFRESHER',
  'CROSS TRAINING',
  'NEW HIRE - TRAINING SUPPORT',
  'LIVE TRAINING QUEUE',
  'CALIBRATION SESSION/REFRESHER',
  'UPSKILLING',
  'SBS'
];

const JURISDICTIONS = [
  'FL-Hillsborough',
  'OH-CourtView/NETData',
  'VA-Fairfax',
  'LA-County - Clerk Connect',
  'GA-County - Odyssey Portal',
  'GA-County - CourtInnovations',
  'VA-Statewide',
  'MI-Wayne',
  'CA-County - Odyssey Portal',
  'NV-Clark',
  'CA-San Bernardino',
  'DC-Washington - CourtView',
  'CA-County - Journal Technologies',
  'TN-County - OCRS Prescreened',
  'AL-County & Statewide',
  'GA-County - IronData',
  'IL-Du Page',
  'TX-Lubbock',
  'MI-Macomb',
  'CA-San Diego',
  'LA-St Tammany',
  'MI-St Clair',
  'OH-Lake',
  'CA-Sacramento',
  'LA-Orleans',
  'TX-County - LGS',
  'CA-Stanislaus',
  'CA-Ventura',
  'MI-Ingham',
  'GA-Clayton',
  'TN-County - CourtInnovations',
  'CA-San Francisco',
  'TN-Hamilton',
  'TN-Anderson',
  'GA-County - Odyssey',
  'MN-County - MCRO',
  'FL-County - CiviTek',
  'MI-Kent',
  'TX-County - Odyssey Portal',
  'IL-County - Judici',
  'NC-County & Statewide',
  'IL-Statewide',
  'AR-County - ARCourts',
  'IL-eMagnus',
  'IN-Statewide',
  'OH-Henschen',
  'LA-Rapides',
  'FL-County - eClerk',
  'ND-County & Statewide - Odyssey',
  'OH-Lucas',
  'LA-County - eSearch',
  'IN-County - MyCase',
  'OH-CourtView/Henschen',
  'PA-County',
  'KS-County - Odyssey Portal',
  'HI-County & Statewide',
  'CT-County & Statewide',
  'TX-Dallas',
  'FL-Miami-Dade',
  'CO-County & Statewide',
  'MO-County',
  'TN-Davidson',
  'TN-County - OCRS',
  'OK-County - OSCN',
  'UT-County & Statewide',
  'WA-County',
  'TX-County - Odyssey',
  'FL-County - Benchmark',
  'TX-Statewide',
  'IA-County',
  'OH-CourtView',
  'TN-Shelby',
  'FL-County - ShowCase',
  'OR-County & Statewide - Odyssey',
  'NM-County & Statewide',
  'TX-Harris',
  'IL-County - Odyssey Portal',
  'RI-County & Statewide - Odyssey Portal',
  'AK-County - CourtView',
  'FL-Broward',
  'OH-CourtView/CourtConnection',
  'OH-Cuyahoga',
  'FL-Polk',
  'OH-Hamilton',
  'FL-Leon',
  'NE-County',
  'FL-Manatee',
  'FL-Volusia',
  'IL-McLean',
  'OH-CourtView/Benchmark',
  'MN-Statewide',
  'FL-County - eCaseView',
  'IL-McHenry',
  'SC-County',
  'OH-Benchmark/Henschen',
  'LA-Jefferson',
  'CA-Kern',
  'OH-Lorain',
  'OH-Odyssey Portal/Benchmark',
  'IN-County - Doxpop',
  'TX-Tarrant',
  'FL-Duval',
  'OH-Licking',
  'FL-Sarasota',
  'FL-Seminole',
  'KS-Statewide',
  'FL-Alachua',
  'FL-Brevard',
  'FL-Citrus',
  'NY-Westchester',
  'TN-Blount',
  'GA-County - Benchmark',
  'OH-CourtInnovations/Henschen',
  'TX-County - TexasOnlineRecords',
  'IL-St Clair',
  'IA-*All County*',
  'FL-Monroe',
  'MI-Statewide',
  'NE-Statewide',
  'PA-Statewide',
  'VT-Statewide',
  'WA-Statewide'
];

// Function to determine task type based on VBA logic
const getTaskType = (taskName: string): TimeEntry['taskType'] => {
  const task = taskName.toUpperCase().trim();
  
  // Prod Direct
  if (['RECORDS', 'INITIAL', 'MANUAL', 'WORK ORDERS', 'LIVE QUEUE', 'FEDCRIM', 'FEDCIV'].includes(task)) {
    return 'Prod Direct';
  }
  
  // Prod Indirect
  if ([
    'TRAINING BLOCKS',
    'SCHEDULED CALIBRATION SESSION/REFRESHER',
    'CROSS TRAINING',
    'NEW HIRE - TRAINING SUPPORT',
    'LIVE TRAINING QUEUE',
    'CALIBRATION SESSION/REFRESHER',
    'UPSKILLING',
    'SBS'
  ].includes(task)) {
    return 'Prod Indirect';
  }
  
  return 'Uncategorized';
};

export function TimeTracker({ onAddEntry, activeEntry, onStopTracking, theme }: TimeTrackerProps) {
  const [caseId, setCaseId] = useState('');
  const [task, setTask] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');

  const handleStartTracking = () => {
    if (!task || !jurisdiction) {
      alert('Please select both task and jurisdiction');
      return;
    }

    // End any active session first (VBA logic)
    if (activeEntry) {
      onStopTracking();
    }

    const newEntry: Omit<TimeEntry, 'id'> = {
      caseId: caseId.trim() || undefined,
      task,
      jurisdiction,
      startTime: new Date(),
      taskType: getTaskType(task)
    };

    onAddEntry(newEntry);
    setCaseId(''); // Clear only case ID as per VBA logic
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Tracker
        </CardTitle>
        <p className="text-blue-100 text-sm">Track productive work time</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {activeEntry && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">Active Session</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {activeEntry.task} - {activeEntry.jurisdiction}
                  {activeEntry.caseId && ` (Case: ${activeEntry.caseId})`}
                </p>
                <p className="text-xs text-green-500 dark:text-green-500">
                  Started: {activeEntry.startTime.toLocaleTimeString()}
                </p>
              </div>
              <Button 
                onClick={onStopTracking}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300"
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Case ID (Optional)
            </label>
            <Input
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Enter case ID"
              className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Task *
            </label>
            <Select value={task} onValueChange={setTask}>
              <SelectTrigger className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
                <div className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300">
                  Prod Direct
                </div>
                {PROD_DIRECT_TASKS.map((taskName) => (
                  <SelectItem 
                    key={taskName} 
                    value={taskName}
                    className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}
                  >
                    {taskName}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 mt-2">
                  Prod Indirect
                </div>
                {PROD_INDIRECT_TASKS.map((taskName) => (
                  <SelectItem 
                    key={taskName} 
                    value={taskName}
                    className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}
                  >
                    {taskName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Jurisdiction *
            </label>
            <Select value={jurisdiction} onValueChange={setJurisdiction}>
              <SelectTrigger className={theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                <SelectValue placeholder="Select jurisdiction" />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
                {JURISDICTIONS.map((jur) => (
                  <SelectItem 
                    key={jur} 
                    value={jur}
                    className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}
                  >
                    {jur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleStartTracking}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!task || !jurisdiction}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Tracking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
