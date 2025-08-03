import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Query,
  Path,
  Security,
  Middlewares
} from 'tsoa';
import { SlotType, SlotStatus, VehicleType } from '@prisma/client';
import { slotService } from '../services/slotService';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireOperator, requireAdmin } from '../middleware/roleMiddleware';

interface CreateSlotRequest {
  slotNumber: string;
  slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

interface UpdateSlotRequest {
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  slotType?: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

interface SlotResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface AutoAssignRequest {
  vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

interface AutoAssignResponse {
  success: boolean;
  message?: string;
  slot?: {
    id: string;
    slotNumber: string;
    slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
  };
}

@Route('api/slots')
@Tags('Slots')
@Security('jwt')
@Middlewares([authMiddleware])
export class SlotController extends Controller {

  /**
   * Get all slots (Operator & Admin - Read Only)
   * @summary Get all parking slots with filters
   */
  @Get('/')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Slots retrieved successfully')
  @Response(403, 'Access forbidden')
  public async getSlots(
    @Query() status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE',
    @Query() type?: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE',
    @Query() page: number = 1,
    @Query() limit: number = 50
  ): Promise<SlotResponse> {
    try {
      const result = await slotService.getSlots({
        status,
        type,
        page,
        limit
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve slots'
      };
    }
  }

  /**
   * Get slot availability map (Operator & Admin - Read Only)
   * @summary Get visual representation of slot availability
   */
  @Get('/availability-map')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Availability map retrieved successfully')
  @Response(403, 'Access forbidden')
  public async getAvailabilityMap(): Promise<SlotResponse> {
    try {
      const map = await slotService.getAvailabilityMap();
      return {
        success: true,
        data: map
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve availability map'
      };
    }
  }

  /**
   * Get available slots (Operator & Admin - Read Only)
   * @summary Get all available slots, optionally filtered by vehicle type compatibility
   */
  @Get('/available')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Available slots retrieved successfully')
  @Response(403, 'Access forbidden')
  public async getAvailableSlots(
    @Query() vehicleType?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE'
  ): Promise<SlotResponse> {
    try {
      const result = await slotService.getAvailableSlots(vehicleType as any);
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve available slots'
      };
    }
  }

  /**
   * Get slot by ID (Operator & Admin - Read Only)
   * @summary Get specific slot details
   */
  @Get('/{slotId}')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Slot retrieved successfully')
  @Response(403, 'Access forbidden')
  @Response(404, 'Slot not found')
  public async getSlotById(@Path() slotId: string): Promise<SlotResponse> {
    try {
      const slot = await slotService.getSlotById(slotId);
      if (!slot) {
        this.setStatus(404);
        return {
          success: false,
          message: 'Slot not found'
        };
      }
      return {
        success: true,
        data: slot
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve slot'
      };
    }
  }

  /**
   * Create new slot (Admin only)
   * @summary Create a new parking slot
   */
  @Post('/')
  @Middlewares([requireAdmin])
  @SuccessResponse(201, 'Slot created successfully')
  @Response(400, 'Invalid request or slot number already exists')
  @Response(403, 'Access forbidden - Admin only')
  public async createSlot(@Body() requestBody: CreateSlotRequest): Promise<SlotResponse> {
    try {
      const result = await slotService.createSlot(requestBody);
      if (!result.success) {
        this.setStatus(400);
      } else {
        this.setStatus(201);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create slot'
      };
    }
  }

  /**
   * Update slot (Admin only)
   * @summary Update slot status or type
   */
  @Put('/{slotId}')
  @Middlewares([requireAdmin])
  @SuccessResponse(200, 'Slot updated successfully')
  @Response(403, 'Access forbidden - Admin only')
  @Response(404, 'Slot not found')
  public async updateSlot(
    @Path() slotId: string,
    @Body() requestBody: UpdateSlotRequest
  ): Promise<SlotResponse> {
    try {
      const result = await slotService.updateSlot(slotId, requestBody);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update slot'
      };
    }
  }

  /**
   * Set slot to maintenance (Admin only)
   * @summary Mark slot as under maintenance
   */
  @Post('/{slotId}/maintenance')
  @Middlewares([requireAdmin])
  @SuccessResponse(200, 'Slot marked for maintenance')
  @Response(400, 'Slot is currently occupied')
  @Response(403, 'Access forbidden - Admin only')
  public async setSlotMaintenance(@Path() slotId: string): Promise<SlotResponse> {
    try {
      const result = await slotService.setSlotMaintenance(slotId);
      if (!result.success) {
        this.setStatus(400);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to set maintenance status'
      };
    }
  }

  /**
   * Release slot from maintenance (Admin only)
   * @summary Mark slot as available after maintenance
   */
  @Post('/{slotId}/release-maintenance')
  @Middlewares([requireAdmin])
  @SuccessResponse(200, 'Slot released from maintenance')
  @Response(403, 'Access forbidden - Admin only')
  @Response(404, 'Slot not found')
  public async releaseSlotMaintenance(@Path() slotId: string): Promise<SlotResponse> {
    try {
      const result = await slotService.releaseSlotMaintenance(slotId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to release maintenance status'
      };
    }
  }

  /**
   * Auto-assign slot (Operator & Admin)
   * @summary Automatically assign best available slot for vehicle type
   */
  @Post('/auto-assign')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Slot assigned successfully')
  @Response(404, 'No available slots for vehicle type')
  @Response(403, 'Access forbidden')
  public async autoAssignSlot(@Body() requestBody: AutoAssignRequest): Promise<AutoAssignResponse> {
    try {
      const result = await slotService.autoAssignSlot(requestBody.vehicleType);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to auto-assign slot'
      };
    }
  }

  /**
   * Reserve slot (Operator & Admin)
   * @summary Reserve a specific slot for manual assignment with row locking
   */
  @Post('/{slotId}/reserve')
  @Middlewares([requireOperator])
  @SuccessResponse(200, 'Slot reserved successfully')
  @Response(409, 'Slot no longer available')
  @Response(403, 'Access forbidden')
  public async reserveSlot(@Path() slotId: string): Promise<SlotResponse> {
    try {
      const result = await slotService.reserveSlotForAssignment(slotId);
      if (!result.success) {
        this.setStatus(409);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reserve slot'
      };
    }
  }

  /**
   * Bulk create slots (Admin only)
   * @summary Create multiple slots at once
   */
  @Post('/bulk')
  @Middlewares([requireAdmin])
  @SuccessResponse(201, 'Slots created successfully')
  @Response(400, 'Invalid request or duplicate slot numbers')
  @Response(403, 'Access forbidden - Admin only')
  public async bulkCreateSlots(
    @Body() requestBody: CreateSlotRequest[]
  ): Promise<SlotResponse> {
    try {
      const result = await slotService.bulkCreateSlots(requestBody);
      if (!result.success) {
        this.setStatus(400);
      } else {
        this.setStatus(201);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create slots'
      };
    }
  }
}