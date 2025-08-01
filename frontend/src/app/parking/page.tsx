"use client";

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { VehicleEntryForm } from '@/components/parking/vehicle-entry-form';
import { AssignmentResult } from '@/components/parking/assignment-result';

interface AssignmentData {
  sessionId: string;
  vehicleId: string;
  slotId: string;
  slotNumber: string;
  entryTime: string;
  billingType: 'HOURLY' | 'DAY_PASS';
  message: string;
}

export default function ParkingManagementPage() {
  const [assignmentResult, setAssignmentResult] = useState<AssignmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssignmentSuccess = (data: AssignmentData) => {
    console.log('Received assignment data in parking page:', data);
    setAssignmentResult(data);
  };

  const handleNewAssignment = () => {
    setAssignmentResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Parking Management</h1>
            <p className="text-gray-600 mt-2">
              Register vehicle entries with automatic or manual slot assignment
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Entry Form */}
            <div className="lg:col-span-1">
              <VehicleEntryForm
                onSuccess={handleAssignmentSuccess}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                disabled={!!assignmentResult}
              />
            </div>

            {/* Assignment Result */}
            <div className="lg:col-span-1">
              <AssignmentResult
                result={assignmentResult}
                onNewAssignment={handleNewAssignment}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <div className="text-sm font-medium text-gray-900">Dashboard</div>
                  <div className="text-sm text-gray-500">View parking statistics</div>
                </button>
                <button 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  onClick={() => window.location.href = '/maintenance'}
                >
                  <div className="text-sm font-medium text-gray-900">Maintenance</div>
                  <div className="text-sm text-gray-500">Manage slot maintenance</div>
                </button>
                <button 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  onClick={() => {
                    // Could add vehicle exit functionality here
                    alert('Vehicle exit feature coming soon!');
                  }}
                >
                  <div className="text-sm font-medium text-gray-900">Vehicle Exit</div>
                  <div className="text-sm text-gray-500">Process vehicle exits</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}