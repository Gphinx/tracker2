import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, UtensilsCrossed, ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import { TimeEntry } from '@/types';

interface QuickActionsProps {
  onAddEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  activeEntry: TimeEntry | null;
  onStopTracking: () => void;
  theme: 'light' | 'dark';
}

// Non-Productive Activities (moved from main tracker)
const NON_PROD_ACTIVITIES = [
  'EMAIL CHECKING',
  'ENGAGEMENT ACTIVITIES', 
  'CLINIC',
  'SITE EVENTS',
  'SKIP LEVEL MEETING',
  'SOFTSKILL TRAINING (L&D)',
  'TECHNICAL ISSUE',
  'MEETING',
  'COACHING'
];

const ISOLVED_URL = 'https://identity.myisolved.com/Account/Login?ReturnUrl=%2F';

export function QuickActions({ onAddEntry, activeEntry, onStopTracking, theme }: QuickActionsProps) {
  const [selectedNonProd, setSelectedNonProd] = useState('');

  const handleQuickAction = (task: string, openUrl: boolean = false) => {
    // End any active session first (VBA logic)
    if (activeEntry) {
      onStopTracking();
    }

    const newEntry: Omit<TimeEntry, 'id'> = {
      task,
      jurisdiction: task === 'LUNCH' ? 'IN-PROGRESS' : '',
      startTime: new Date(),
      taskType: 'Non-Prod'
    };

    onAddEntry(newEntry);

    // Open iSolved URL in new tab (VBA logic)
    if (openUrl) {
      window.open(ISOLVED_URL, '_blank');
    }
  };

  const handleNonProdActivity = () => {
    if (!selectedNonProd) {
      alert('Please select a non-productive activity');
      return;
    }

    handleQuickAction(selectedNonProd);
    setSelectedNonProd('');
  };

  const handleBackAction = () => {
    if (activeEntry) {
      onStopTracking();
      window.open(ISOLVED_URL, '_blank');
    } else {
      alert('No active session to end');
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <p className="text-green-100 text-sm">Log breaks, meetings, and non-productive activities</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Break and Lunch Buttons (CommandButton2 & CommandButton3) */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleQuickAction('BREAK', true)}
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
          >
            <Coffee className="w-4 h-4" />
            Break
            <ExternalLink className="w-3 h-3" />
          </Button>
          
          <Button
            onClick={() => handleQuickAction('LUNCH', true)}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Lunch
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        {/* Back Button (CommandButton9 logic) */}
        <Button
          onClick={handleBackAction}
          variant="outline"
          className={`w-full border-gray-300 hover:bg-gray-50 ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-gray-200' : ''}`}
          disabled={!activeEntry}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back (End Session & Open iSolved)
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>

        {/* Non-Productive Activities Dropdown */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Non-Productive Activities
          </label>
          <div className="flex gap-2">
            <Select value={selectedNonProd} onValueChange={setSelectedNonProd}>
              <SelectTrigger className={`flex-1 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                <SelectValue placeholder="Select non-productive activity" />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}>
                {NON_PROD_ACTIVITIES.map((activity) => (
                  <SelectItem 
                    key={activity} 
                    value={activity}
                    className={theme === 'dark' ? 'text-white hover:bg-gray-600' : ''}
                  >
                    {activity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleNonProdActivity}
              disabled={!selectedNonProd}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Start
            </Button>
          </div>
        </div>

        {/* Additional Quick Buttons (CommandButton4, CommandButton5, CommandButton6, CommandButton7) */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            onClick={() => handleQuickAction('BIO')}
            variant="outline"
            size="sm"
            className={`text-xs ${theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
          >
            Bio Break
          </Button>
          <Button
            onClick={() => handleQuickAction('MEETING')}
            variant="outline"
            size="sm"
            className={`text-xs ${theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
          >
            Meeting
          </Button>
          <Button
            onClick={() => handleQuickAction('COACHING')}
            variant="outline"
            size="sm"
            className={`text-xs ${theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
          >
            Coaching
          </Button>
          <Button
            onClick={() => handleQuickAction('TECH ISSUE')}
            variant="outline"
            size="sm"
            className={`text-xs ${theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : ''}`}
          >
            Tech Issue
          </Button>
        </div>

        {/* Active Session Info */}
        {activeEntry && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              Current Activity: {activeEntry.task}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              Started: {activeEntry.startTime.toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
