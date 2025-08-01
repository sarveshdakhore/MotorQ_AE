"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { parkingApi, CurrentlyParkedVehicle } from '@/lib/parking-api';
import { 
  Car, 
  Bike, 
  Zap, 
  Accessibility, 
  Clock, 
  MapPin, 
  DollarSign,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface CurrentSessionsProps {
  refreshTrigger?: number;
}

export function CurrentSessions({ refreshTrigger }: CurrentSessionsProps) {
  const [sessions, setSessions] = useState<CurrentlyParkedVehicle[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<CurrentlyParkedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCurrentSessions();
  }, [refreshTrigger]);

  useEffect(() => {
    // Filter sessions based on selected vehicle type
    if (!sessions || sessions.length === 0) {
      setFilteredSessions([]);
      return;
    }

    if (selectedVehicleType === 'all') {
      setFilteredSessions(sessions);
    } else {
      setFilteredSessions(sessions.filter(session => 
        session.vehicle.vehicleType === selectedVehicleType
      ));
    }
  }, [sessions, selectedVehicleType]);

  const fetchCurrentSessions = async () => {
    try {
      setIsLoading(true);
      const response = await parkingApi.getCurrentlyParkedVehicles({
        page: pagination?.page || 1,
        limit: pagination?.limit || 20
      });
      setSessions(response.vehicles);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch current sessions:', error);
      toast.error('Failed to load current sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR':
        return Car;
      case 'BIKE':
        return Bike;
      case 'EV':
        return Zap;
      case 'HANDICAP_ACCESSIBLE':
        return Accessibility;
      default:
        return Car;
    }
  };

  const getVehicleTypeBadge = (type: string) => {
    const colors = {
      CAR: 'bg-blue-500 text-white',
      BIKE: 'bg-green-500 text-white',
      EV: 'bg-yellow-500 text-white',
      HANDICAP_ACCESSIBLE: 'bg-purple-500 text-white',
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-500 text-white'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getBillingTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'HOURLY' ? 'default' : 'secondary'}>
        {type === 'HOURLY' ? 'Hourly' : 'Day Pass'}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const isActive = status.toLowerCase() === 'active';
    return (
      <Badge variant={isActive ? 'success' : 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatDuration = (entryTime: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const vehicleTypeCounts = (sessions || []).reduce((acc, session) => {
    const type = session.vehicle.vehicleType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Parking Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{vehicleTypeCounts.CAR || 0}</div>
                <div className="text-sm text-gray-600">Cars</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Bike className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{vehicleTypeCounts.BIKE || 0}</div>
                <div className="text-sm text-gray-600">Bikes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{vehicleTypeCounts.EV || 0}</div>
                <div className="text-sm text-gray-600">EVs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Accessibility className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{vehicleTypeCounts.HANDICAP_ACCESSIBLE || 0}</div>
                <div className="text-sm text-gray-600">Accessible</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Current Parking Sessions</CardTitle>
              <CardDescription>
                {(filteredSessions || []).length} vehicle{(filteredSessions || []).length !== 1 ? 's' : ''} currently parked
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                  className="w-40"
                >
                  <option value="all">All Types</option>
                  <option value="CAR">Cars</option>
                  <option value="BIKE">Bikes</option>
                  <option value="EV">EVs</option>
                  <option value="HANDICAP_ACCESSIBLE">Accessible</option>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={fetchCurrentSessions}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(filteredSessions || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedVehicleType === 'all' 
                ? 'No vehicles currently parked' 
                : `No ${selectedVehicleType.toLowerCase().replace('_', ' ')} vehicles currently parked`}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Entry Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredSessions || []).map((session) => {
                  const Icon = getVehicleIcon(session.vehicle.vehicleType);
                  return (
                    <TableRow key={session.sessionId}>
                      <TableCell>
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-2 text-gray-600" />
                          <div>
                            <div className="font-medium">{session.vehicle.numberPlate}</div>
                            <div className="text-sm text-gray-500">
                              {getVehicleTypeBadge(session.vehicle.vehicleType)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="font-medium">{session.slot.number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{session.duration}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {getBillingTypeBadge(session.billingType)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(session.entryTime).toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}