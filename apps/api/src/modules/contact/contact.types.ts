export interface ContactDoc {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export type CreateContactInput = Omit<ContactDoc, "id" | "createdAt">;
