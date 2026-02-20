export class TaxResponseDto {
    id: number;
    value: number;
    isPercentage: boolean;
  
    taxType: {
      id: number;
      code: string;
      name: string;
    };
  
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
  }