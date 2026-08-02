export interface ProductDoc {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  unit: string;
  description: string;
  image: string;
  badge: string | null;
  stock: number;
}
