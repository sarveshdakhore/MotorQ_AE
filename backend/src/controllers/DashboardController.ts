import {
  Controller,
  Get,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Query,
  Security,
  Middlewares
} from 'tsoa';
import { SlotType, VehicleType } from '@prisma/client';
import { dashboardService } from '../services/dashboardService';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireOperator, requireAdmin } from '../middleware/roleMiddleware';

interface DashboardStats {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  maintenanceSlots: number;
  occupancyRate: number;
  slotsByType: {
    type: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
  }[];
  vehiclesByType: {
    type: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
    count: number;
    percentage: number;
  }[];
}

interface RevenueStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  byBillingType: {
    hourly: number;
    dayPass: number;
  };
}

interface ActivityStats {
  entriesLastHour: number;
  exitsLastHour: number;
  averageParkingDuration: string;
  peakHours: {
    hour: number;
    entries: number;
  }[];
}

@Route('api/dashboard')
@Tags('Dashboard')
@Security('jwt')
@Middlewares([authMiddleware])
export class DashboardController extends Controller {

  /**
   * Get dashboard statistics (Operator & Admin)
   * @summary Get real-time parking statistics
   */
  @Get('/stats')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Dashboard statistics retrieved successfully')
  @Response(403, 'Access forbidden')
  public async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    try {
      const stats = await dashboardService.getDashboardStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {
          totalSlots: 0,
          occupiedSlots: 0,
          availableSlots: 0,
          maintenanceSlots: 0,
          occupancyRate: 0,
          slotsByType: [],
          vehiclesByType: []
        }
      };
    }
  }

  /**
   * Get revenue statistics (Admin only)
   * @summary Get revenue statistics for different periods
   */
  @Get('/revenue')
  @Middlewares([requireAdmin])
  @SuccessResponse(200, 'Revenue statistics retrieved successfully')
  @Response(403, 'Access forbidden - Admin only')
  public async getRevenueStats(
    @Query() startDate?: string,
    @Query() endDate?: string
  ): Promise<{ success: boolean; data: RevenueStats }> {
    try {
      const stats = await dashboardService.getRevenueStats({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      });
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          byBillingType: {
            hourly: 0,
            dayPass: 0
          }
        }
      };
    }
  }

  /**
   * Get activity statistics (Operator & Admin)
   * @summary Get parking activity statistics
   */
  @Get('/activity')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Activity statistics retrieved successfully')
  @Response(403, 'Access forbidden')
  public async getActivityStats(): Promise<{ success: boolean; data: ActivityStats }> {
    try {
      const stats = await dashboardService.getActivityStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {
          entriesLastHour: 0,
          exitsLastHour: 0,
          averageParkingDuration: '0h 0m',
          peakHours: []
        }
      };
    }
  }

  /**
   * Get occupancy trends (Operator & Admin)
   * @summary Get occupancy trends over time
   */
  @Get('/occupancy-trends')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Occupancy trends retrieved successfully')
  @Response(403, 'Access forbidden')
  public async getOccupancyTrends(
    @Query() period: 'day' | 'week' | 'month' = 'day'
  ): Promise<{ success: boolean; data: any[] }> {
    try {
      const trends = await dashboardService.getOccupancyTrends(period);
      return {
        success: true,
        data: trends
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: []
      };
    }
  }

  /**
   * Get real-time updates (Operator & Admin)
   * @summary Get real-time parking updates for live dashboard
   */
  @Get('/realtime')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Real-time updates retrieved successfully')
  @Response(403, 'Access forbidden')
  public async getRealtimeUpdates(): Promise<{ success: boolean; data: any }> {
    try {
      const updates = await dashboardService.getRealtimeUpdates();
      return {
        success: true,
        data: updates
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {
          lastUpdate: new Date(),
          recentEntries: [],
          recentExits: [],
          alerts: []
        }
      };
    }
  }

  /**
   * Get slot availability summary (Operator & Admin)
   * @summary Get detailed slot availability by type and location
   */
  @Get('/slot-availability')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Slot availability retrieved successfully')
  @Response(403, 'Access forbidden')
  public async getSlotAvailability(
    @Query() slotType?: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE'
  ): Promise<{ success: boolean; data: any }> {
    try {
      const availability = await dashboardService.getSlotAvailability(slotType);
      return {
        success: true,
        data: availability
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {}
      };
    }
  }
}