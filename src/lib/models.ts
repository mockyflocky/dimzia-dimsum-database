
export interface CustomerOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  deliveryMethod: string;
  address?: string;
  distance?: number;
  deliveryCost?: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalItems: number;
  subtotal: number;
  orderDate: string;
}
