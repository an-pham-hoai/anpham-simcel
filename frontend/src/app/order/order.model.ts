export interface Order {
    _id: string;
    orderNumber: string;
    customerName: string;
    items: any[];  // This could be a more detailed structure depending on backend schema
    status: string;
    totalQuantity: number;
    createdAt: Date;
    updatedAt: Date;
  }
  