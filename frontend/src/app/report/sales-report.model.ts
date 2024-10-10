export interface SalesReport {
    _id: {
        month: number;
        year: number;
    };
    totalOrders: number;
    totalQuantity: number;
}
