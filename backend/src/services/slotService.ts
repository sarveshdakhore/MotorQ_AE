import { PrismaClient } from '@prisma/client';
import { SlotType, SlotStatus, VehicleType, SessionStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface SlotFilters {
  status?: SlotStatus;
  type?: SlotType;
  page: number;
  limit: number;
}

interface CreateSlotRequest {
  slotNumber: string;
  slotType: SlotType;
}

interface UpdateSlotRequest {
  status?: SlotStatus;
  slotType?: SlotType;
}

class SlotService {
  async getSlots(filters: SlotFilters) {
    try {
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.type) where.slotType = filters.type;

      const [slots, total] = await Promise.all([
        prisma.parkingSlot.findMany({
          where,
          include: {
            sessions: {
              where: { status: SessionStatus.ACTIVE },
              include: { vehicle: true }
            }
          },
          orderBy: { slotNumber: 'asc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.parkingSlot.count({ where })
      ]);

      const slotsWithDetails = slots.map(slot => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        slotType: slot.slotType,
        status: slot.status,
        currentVehicle: slot.sessions[0] ? {
          numberPlate: slot.sessions[0].vehicle.numberPlate,
          vehicleType: slot.sessions[0].vehicle.vehicleType,
          entryTime: slot.sessions[0].entryTime
        } : null,
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt
      }));

      return {
        slots: slotsWithDetails,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting slots:', error);
      throw error;
    }
  }

  async getSlotById(slotId: string) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId },
        include: {
          sessions: {
            include: { vehicle: true },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!slot) return null;

      const currentSession = slot.sessions.find(session => session.status === SessionStatus.ACTIVE);
      const sessionHistory = slot.sessions.filter(session => session.status === SessionStatus.COMPLETED);

      return {
        id: slot.id,
        slotNumber: slot.slotNumber,
        slotType: slot.slotType,
        status: slot.status,
        currentSession: currentSession ? {
          id: currentSession.id,
          vehicle: {
            numberPlate: currentSession.vehicle.numberPlate,
            vehicleType: currentSession.vehicle.vehicleType
          },
          entryTime: currentSession.entryTime,
          billingType: currentSession.billingType
        } : null,
        sessionHistory: sessionHistory.map(session => ({
          id: session.id,
          vehicle: {
            numberPlate: session.vehicle.numberPlate,
            vehicleType: session.vehicle.vehicleType
          },
          entryTime: session.entryTime,
          exitTime: session.exitTime,
          billingAmount: session.billingAmount ? Number(session.billingAmount) : 0,
          duration: session.exitTime ? this.formatDuration(
            session.exitTime.getTime() - session.entryTime.getTime()
          ) : '0h 0m'
        })),
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt
      };
    } catch (error) {
      console.error('Error getting slot by ID:', error);
      throw error;
    }
  }

  async createSlot(data: CreateSlotRequest) {
    try {
      // Check if slot number already exists
      const existingSlot = await prisma.parkingSlot.findUnique({
        where: { slotNumber: data.slotNumber }
      });

      if (existingSlot) {
        return {
          success: false,
          message: `Slot number ${data.slotNumber} already exists`
        };
      }

      const slot = await prisma.parkingSlot.create({
        data: {
          slotNumber: data.slotNumber,
          slotType: data.slotType,
          status: SlotStatus.AVAILABLE
        }
      });

      return {
        success: true,
        message: 'Slot created successfully',
        data: slot
      };
    } catch (error) {
      console.error('Error creating slot:', error);
      return {
        success: false,
        message: 'Failed to create slot'
      };
    }
  }

  async updateSlot(slotId: string, data: UpdateSlotRequest) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId },
        include: {
          sessions: {
            where: { status: SessionStatus.ACTIVE }
          }
        }
      });

      if (!slot) {
        return {
          success: false,
          message: 'Slot not found'
        };
      }

      // If trying to change status to MAINTENANCE, ensure slot is not occupied
      if (data.status === SlotStatus.MAINTENANCE && slot.sessions.length > 0) {
        return {
          success: false,
          message: 'Cannot set slot to maintenance while it is occupied'
        };
      }

      const updatedSlot = await prisma.parkingSlot.update({
        where: { id: slotId },
        data
      });

      return {
        success: true,
        message: 'Slot updated successfully',
        data: updatedSlot
      };
    } catch (error) {
      console.error('Error updating slot:', error);
      return {
        success: false,
        message: 'Failed to update slot'
      };
    }
  }

  async autoAssignSlot(vehicleType: VehicleType) {
    try {
      const slotTypeMapping = {
        [VehicleType.CAR]: [SlotType.REGULAR, SlotType.COMPACT],
        [VehicleType.BIKE]: [SlotType.REGULAR],
        [VehicleType.EV]: [SlotType.EV],
        [VehicleType.HANDICAP_ACCESSIBLE]: [SlotType.HANDICAP_ACCESSIBLE]
      };

      const compatibleSlotTypes = slotTypeMapping[vehicleType];

      // Find the best available slot
      const availableSlot = await prisma.parkingSlot.findFirst({
        where: {
          status: SlotStatus.AVAILABLE,
          slotType: { in: compatibleSlotTypes }
        },
        orderBy: [
          // Prioritize exact match first, then by slot number
          { slotType: vehicleType === VehicleType.EV ? 'desc' : 'asc' },
          { slotNumber: 'asc' }
        ]
      });

      if (!availableSlot) {
        return {
          success: false,
          message: `No available slots for ${vehicleType} vehicles`
        };
      }

      return {
        success: true,
        message: 'Slot assigned successfully',
        slot: {
          id: availableSlot.id,
          slotNumber: availableSlot.slotNumber,
          slotType: availableSlot.slotType
        }
      };
    } catch (error) {
      console.error('Error auto-assigning slot:', error);
      return {
        success: false,
        message: 'Failed to auto-assign slot'
      };
    }
  }

  async setSlotMaintenance(slotId: string) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId },
        include: {
          sessions: {
            where: { status: SessionStatus.ACTIVE }
          }
        }
      });

      if (!slot) {
        return {
          success: false,
          message: 'Slot not found'
        };
      }

      if (slot.sessions.length > 0) {
        return {
          success: false,
          message: 'Cannot set slot to maintenance while it is occupied'
        };
      }

      await prisma.parkingSlot.update({
        where: { id: slotId },
        data: { status: SlotStatus.MAINTENANCE }
      });

      return {
        success: true,
        message: `Slot ${slot.slotNumber} marked for maintenance`
      };
    } catch (error) {
      console.error('Error setting slot maintenance:', error);
      return {
        success: false,
        message: 'Failed to set maintenance status'
      };
    }
  }

  async releaseSlotMaintenance(slotId: string) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId }
      });

      if (!slot) {
        return {
          success: false,
          message: 'Slot not found'
        };
      }

      await prisma.parkingSlot.update({
        where: { id: slotId },
        data: { status: SlotStatus.AVAILABLE }
      });

      return {
        success: true,
        message: `Slot ${slot.slotNumber} released from maintenance`
      };
    } catch (error) {
      console.error('Error releasing slot maintenance:', error);
      return {
        success: false,
        message: 'Failed to release maintenance status'
      };
    }
  }

  async getAvailabilityMap() {
    try {
      const slots = await prisma.parkingSlot.findMany({
        include: {
          sessions: {
            where: { status: SessionStatus.ACTIVE },
            include: { vehicle: true }
          }
        },
        orderBy: { slotNumber: 'asc' }
      });

      // Group slots by area/floor (assuming slot numbers like "A1-01", "B2-15")
      const slotMap = new Map();

      slots.forEach(slot => {
        const area = slot.slotNumber.split('-')[0] || 'MAIN';
        
        if (!slotMap.has(area)) {
          slotMap.set(area, {
            area,
            totalSlots: 0,
            availableSlots: 0,
            occupiedSlots: 0,
            maintenanceSlots: 0,
            slots: []
          });
        }

        const areaData = slotMap.get(area);
        areaData.totalSlots++;
        
        switch (slot.status) {
          case SlotStatus.AVAILABLE:
            areaData.availableSlots++;
            break;
          case SlotStatus.OCCUPIED:
            areaData.occupiedSlots++;
            break;
          case SlotStatus.MAINTENANCE:
            areaData.maintenanceSlots++;
            break;
        }

        areaData.slots.push({
          id: slot.id,
          slotNumber: slot.slotNumber,
          slotType: slot.slotType,
          status: slot.status,
          currentVehicle: slot.sessions[0] ? {
            numberPlate: slot.sessions[0].vehicle.numberPlate,
            vehicleType: slot.sessions[0].vehicle.vehicleType
          } : null
        });
      });

      return {
        areas: Array.from(slotMap.values()),
        summary: {
          totalSlots: slots.length,
          availableSlots: slots.filter(s => s.status === SlotStatus.AVAILABLE).length,
          occupiedSlots: slots.filter(s => s.status === SlotStatus.OCCUPIED).length,
          maintenanceSlots: slots.filter(s => s.status === SlotStatus.MAINTENANCE).length
        }
      };
    } catch (error) {
      console.error('Error getting availability map:', error);
      throw error;
    }
  }

  async bulkCreateSlots(slotsData: CreateSlotRequest[]) {
    try {
      // Check for duplicate slot numbers within the request
      const slotNumbers = slotsData.map(slot => slot.slotNumber);
      const uniqueSlotNumbers = new Set(slotNumbers);
      
      if (slotNumbers.length !== uniqueSlotNumbers.size) {
        return {
          success: false,
          message: 'Duplicate slot numbers found in request'
        };
      }

      // Check for existing slot numbers in database
      const existingSlots = await prisma.parkingSlot.findMany({
        where: {
          slotNumber: { in: slotNumbers }
        }
      });

      if (existingSlots.length > 0) {
        const existingNumbers = existingSlots.map(slot => slot.slotNumber);
        return {
          success: false,
          message: `The following slot numbers already exist: ${existingNumbers.join(', ')}`
        };
      }

      // Create all slots
      const createdSlots = await prisma.parkingSlot.createMany({
        data: slotsData.map(slot => ({
          slotNumber: slot.slotNumber,
          slotType: slot.slotType,
          status: SlotStatus.AVAILABLE
        }))
      });

      return {
        success: true,
        message: `Successfully created ${createdSlots.count} slots`,
        data: { count: createdSlots.count }
      };
    } catch (error) {
      console.error('Error bulk creating slots:', error);
      return {
        success: false,
        message: 'Failed to create slots'
      };
    }
  }

  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export const slotService = new SlotService();