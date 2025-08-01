import { PrismaClient } from '@prisma/client';
import { VehicleType, BillingType, SlotStatus, SessionStatus, SlotType } from '@prisma/client';
import { slotService } from './slotService';

const prisma = new PrismaClient();

interface VehicleEntryRequest {
  numberPlate: string;
  vehicleType: VehicleType;
  billingType: BillingType;
  slotId?: string;
}

interface SearchFilters {
  vehicleType?: VehicleType;
  page: number;
  limit: number;
}

interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  vehicleType?: VehicleType;
  page: number;
  limit: number;
}

class ParkingService {
  async registerVehicleEntry(data: VehicleEntryRequest) {
    try {
      // Check if vehicle already has an active session
      const activeSession = await prisma.parkingSession.findFirst({
        where: {
          vehicle: { numberPlate: data.numberPlate },
          status: SessionStatus.ACTIVE
        },
        include: {
          vehicle: true,
          slot: true
        }
      });

      if (activeSession) {
        return {
          success: false,
          message: `Vehicle ${data.numberPlate} is already parked in slot ${activeSession.slot.slotNumber}`
        };
      }

      let slotAssignmentResult;

      if (data.slotId) {
        // Manual slot assignment with row locking
        slotAssignmentResult = await slotService.reserveSlotForAssignment(data.slotId);
        
        if (!slotAssignmentResult.success) {
          return {
            success: false,
            message: slotAssignmentResult.message || 'Failed to reserve selected slot'
          };
        }
      } else {
        // Auto slot assignment with fallback logic and row locking
        slotAssignmentResult = await slotService.autoAssignSlot(data.vehicleType);
        
        if (!slotAssignmentResult.success) {
          return {
            success: false,
            message: slotAssignmentResult.message || `No available slots for ${data.vehicleType} vehicles`
          };
        }
      }

      const assignedSlot = slotAssignmentResult.slot;
      if (!assignedSlot) {
        return {
          success: false,
          message: 'Failed to get slot assignment details'
        };
      }

      // Create or get vehicle
      let vehicle = await prisma.vehicle.findUnique({
        where: { numberPlate: data.numberPlate }
      });

      if (!vehicle) {
        vehicle = await prisma.vehicle.create({
          data: {
            numberPlate: data.numberPlate,
            vehicleType: data.vehicleType
          }
        });
      }

      // Create parking session and update slot status with enhanced transaction handling
      const session = await prisma.$transaction(async (tx) => {
        // Double-check slot is still available before final assignment
        const currentSlot = await tx.parkingSlot.findFirst({
          where: { 
            id: assignedSlot.id,
            status: SlotStatus.AVAILABLE 
          }
        });

        if (!currentSlot) {
          throw new Error('Slot is no longer available - please try again');
        }

        // Update slot status
        await tx.parkingSlot.update({
          where: { id: assignedSlot.id },
          data: { status: SlotStatus.OCCUPIED }
        });

        // Create session
        return await tx.parkingSession.create({
          data: {
            vehicleId: vehicle.id,
            slotId: assignedSlot.id,
            billingType: data.billingType,
            status: SessionStatus.ACTIVE
          },
          include: {
            vehicle: true,
            slot: true
          }
        });
      }, {
        timeout: 10000,  // 10 second timeout for the entire transaction
        isolationLevel: 'ReadCommitted'
      });

      return {
        success: true,
        message: 'Vehicle entry registered successfully',
        data: {
          sessionId: session.id,
          vehicleId: vehicle.id,
          slotId: assignedSlot.id,
          slotNumber: assignedSlot.slotNumber,
          entryTime: session.entryTime,
          billingType: session.billingType
        }
      };
    } catch (error) {
      console.error('Error registering vehicle entry:', error);
      throw error;
    }
  }

  async registerVehicleExit(numberPlate: string) {
    try {
      const activeSession = await prisma.parkingSession.findFirst({
        where: {
          vehicle: { numberPlate },
          status: SessionStatus.ACTIVE
        },
        include: {
          vehicle: true,
          slot: true
        }
      });

      if (!activeSession) {
        return {
          success: false,
          message: `No active parking session found for vehicle ${numberPlate}`
        };
      }

      const exitTime = new Date();
      const durationMs = exitTime.getTime() - activeSession.entryTime.getTime();
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
      const durationString = this.formatDuration(durationMs);

      // Calculate billing amount
      let billingAmount = 0;
      if (activeSession.billingType === BillingType.HOURLY) {
        const pricing = await prisma.pricingConfig.findFirst({
          where: {
            vehicleType: activeSession.vehicle.vehicleType,
            billingType: BillingType.HOURLY,
            isActive: true
          }
        });
        billingAmount = pricing ? Number(pricing.hourlyRate) * durationHours : durationHours * 10; // Default rate
      } else {
        const pricing = await prisma.pricingConfig.findFirst({
          where: {
            vehicleType: activeSession.vehicle.vehicleType,
            billingType: BillingType.DAY_PASS,
            isActive: true
          }
        });
        billingAmount = pricing ? Number(pricing.dayPassRate) : 100; // Default day pass rate
      }

      // Complete session and free slot
      await prisma.$transaction(async (tx) => {
        // Update session
        await tx.parkingSession.update({
          where: { id: activeSession.id },
          data: {
            exitTime,
            status: SessionStatus.COMPLETED,
            billingAmount
          }
        });

        // Free the slot
        await tx.parkingSlot.update({
          where: { id: activeSession.slotId },
          data: { status: SlotStatus.AVAILABLE }
        });
      });

      return {
        success: true,
        message: 'Vehicle exit registered successfully',
        data: {
          sessionId: activeSession.id,
          entryTime: activeSession.entryTime,
          exitTime,
          duration: durationString,
          billingAmount,
          billingType: activeSession.billingType
        }
      };
    } catch (error) {
      console.error('Error registering vehicle exit:', error);
      throw error;
    }
  }

  async searchVehicle(numberPlate: string) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { numberPlate },
        include: {
          sessions: {
            include: {
              slot: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!vehicle) {
        return {
          success: false,
          message: `Vehicle ${numberPlate} not found`
        };
      }

      const currentSession = vehicle.sessions.find(session => session.status === SessionStatus.ACTIVE);
      
      const parkingHistory = vehicle.sessions
        .filter(session => session.status === SessionStatus.COMPLETED)
        .slice(0, 10) // Last 10 sessions
        .map(session => ({
          id: session.id,
          slotNumber: session.slot.slotNumber,
          entryTime: session.entryTime,
          exitTime: session.exitTime,
          billingAmount: session.billingAmount ? Number(session.billingAmount) : 0,
          duration: session.exitTime ? this.formatDuration(
            session.exitTime.getTime() - session.entryTime.getTime()
          ) : '0h 0m'
        }));

      return {
        success: true,
        data: {
          vehicle: {
            id: vehicle.id,
            numberPlate: vehicle.numberPlate,
            vehicleType: vehicle.vehicleType
          },
          currentSession: currentSession ? {
            id: currentSession.id,
            slotNumber: currentSession.slot.slotNumber,
            entryTime: currentSession.entryTime,
            billingType: currentSession.billingType,
            status: currentSession.status
          } : undefined,
          parkingHistory
        }
      };
    } catch (error) {
      console.error('Error searching vehicle:', error);
      throw error;
    }
  }

  async quickSearchVehicles(query: string) {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          numberPlate: {
            contains: query,
            mode: 'insensitive'
          }
        },
        include: {
          sessions: {
            where: { status: SessionStatus.ACTIVE },
            include: { slot: true }
          }
        },
        take: 10
      });

      return vehicles.map(vehicle => ({
        id: vehicle.id,
        numberPlate: vehicle.numberPlate,
        vehicleType: vehicle.vehicleType,
        isCurrentlyParked: vehicle.sessions.length > 0,
        currentSlot: vehicle.sessions[0]?.slot.slotNumber
      }));
    } catch (error) {
      console.error('Error in quick search:', error);
      throw error;
    }
  }

  async getCurrentlyParkedVehicles(filters: SearchFilters) {
    try {
      const where: any = {
        status: SessionStatus.ACTIVE
      };

      if (filters.vehicleType) {
        where.vehicle = { vehicleType: filters.vehicleType };
      }

      const [sessions, total] = await Promise.all([
        prisma.parkingSession.findMany({
          where,
          include: {
            vehicle: true,
            slot: true
          },
          orderBy: { entryTime: 'desc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.parkingSession.count({ where })
      ]);

      const data = sessions.map(session => ({
        sessionId: session.id,
        vehicle: {
          numberPlate: session.vehicle.numberPlate,
          vehicleType: session.vehicle.vehicleType
        },
        slot: {
          number: session.slot.slotNumber,
          type: session.slot.slotType
        },
        entryTime: session.entryTime,
        duration: this.formatDuration(Date.now() - session.entryTime.getTime()),
        billingType: session.billingType
      }));

      return {
        success: true,
        data,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting currently parked vehicles:', error);
      throw error;
    }
  }

  async getParkingHistory(filters: HistoryFilters) {
    try {
      const where: any = {
        status: SessionStatus.COMPLETED
      };

      if (filters.startDate || filters.endDate) {
        where.entryTime = {};
        if (filters.startDate) where.entryTime.gte = filters.startDate;
        if (filters.endDate) where.entryTime.lte = filters.endDate;
      }

      if (filters.vehicleType) {
        where.vehicle = { vehicleType: filters.vehicleType };
      }

      const [sessions, total] = await Promise.all([
        prisma.parkingSession.findMany({
          where,
          include: {
            vehicle: true,
            slot: true
          },
          orderBy: { exitTime: 'desc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.parkingSession.count({ where })
      ]);

      const data = sessions.map(session => ({
        sessionId: session.id,
        vehicle: {
          numberPlate: session.vehicle.numberPlate,
          vehicleType: session.vehicle.vehicleType
        },
        slot: {
          number: session.slot.slotNumber,
          type: session.slot.slotType
        },
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        duration: session.exitTime ? this.formatDuration(
          session.exitTime.getTime() - session.entryTime.getTime()
        ) : '0h 0m',
        billingAmount: session.billingAmount ? Number(session.billingAmount) : 0,
        billingType: session.billingType
      }));

      return {
        success: true,
        data,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting parking history:', error);
      throw error;
    }
  }


  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export const parkingService = new ParkingService();