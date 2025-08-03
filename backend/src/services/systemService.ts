import { VehicleType, SlotType, SlotStatus, SessionStatus, BillingType } from '@prisma/client';

interface SystemEnums {
  vehicleTypes: string[];
  slotTypes: string[];
  slotStatuses: string[];
  sessionStatuses: string[];
  billingTypes: string[];
}

interface SystemConfig {
  apiVersion: string;
  defaultBillingType: string;
  supportedFeatures: string[];
}

class SystemService {
  getEnums(): SystemEnums {
    return {
      vehicleTypes: Object.values(VehicleType),
      slotTypes: Object.values(SlotType),
      slotStatuses: Object.values(SlotStatus),
      sessionStatuses: Object.values(SessionStatus),
      billingTypes: Object.values(BillingType)
    };
  }

  getSystemConfig(): { enums: SystemEnums; systemConfig: SystemConfig } {
    return {
      enums: this.getEnums(),
      systemConfig: {
        apiVersion: '1.0.0',
        defaultBillingType: BillingType.HOURLY,
        supportedFeatures: [
          'vehicle-entry',
          'auto-slot-assignment',
          'manual-slot-override',
          'maintenance-mode',
          'real-time-dashboard',
          'vehicle-search',
          'billing-calculation'
        ]
      }
    };
  }

  getVehicleTypes(): string[] {
    return Object.values(VehicleType);
  }

  getSlotTypes(): string[] {
    return Object.values(SlotType);
  }

  getBillingTypes(): string[] {
    return Object.values(BillingType);
  }
}

export const systemService = new SystemService();
