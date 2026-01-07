
export enum ComponentType {
  PLC = 'PLC',
  HMI = 'HMI',
  MFM = 'Multifunction Meter',
  VMR = 'Voltage Monitoring Relay',
  SCADA = 'SCADA System',
  ACB = 'Air Circuit Breaker',
  CONTACTOR = 'Contactor',
  MCCB = 'MCCB',
  MCB = 'MCB'
}

export interface HardwareItem {
  id: string;
  type: ComponentType;
  make: string;
  model: string;
  rating?: string;
  quantity: number;
  condition: 'Good' | 'Fair' | 'Critical';
}

export interface ServiceReport {
  slNo: string;
  complaintNo: string;
  customerName: string;
  clientName: string;
  clientMobile: string;
  location: string;
  date: string;
  time: string;
  product: string;
  natureOfFault: string;
  hardware: HardwareItem[];
  observations: string;
  environment: 'Normal' | 'Humid' | 'Corrosive' | 'Dusty';
  voltageLL: string;
  voltageLN: string;
  operationMode: 'Manual' | 'Auto' | 'Remote';
  status: 'Closed' | 'Open';
  engineerName: string;
  technicianMobile: string;
  customerContact: string;
  feedbackRating: 'Excellence' | 'Very Good' | 'Good' | 'Average' | 'Below Average';
}
