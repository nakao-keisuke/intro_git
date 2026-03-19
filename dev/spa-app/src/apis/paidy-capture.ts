export type Buyer = {
  name1: string;
  name2: string;
  email: string;
  phone: string;
};

export type OrderItem = {
  id: string;
  title: string;
  description: string;
  unit_price: number;
  quantity: number;
};

export type Order = {
  items: OrderItem[];
  tax: number;
  shipping: number;
  order_ref: string;
  updated_at: string;
};

export type ShippingAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
};

export type Capture = {
  id: string;
  created_at: string;
  amount: number;
  tax: number;
  shipping: number;
  items: OrderItem[];
  metadata: { [key: string]: string };
};

export type PaidyCaptureResponse = {
  id: string;
  created_at: string;
  expires_at: string;
  amount: number;
  currency: string;
  description: string;
  store_name: string;
  test: boolean;
  status: string;
  tier: string;
  buyer: Buyer;
  order: Order;
  shipping_address: ShippingAddress;
  captures: Capture[];
  metadata: { [key: string]: string };
};
