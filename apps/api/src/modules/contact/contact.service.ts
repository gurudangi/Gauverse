import { v4 as uuid } from "uuid";
import { contactRepository } from "./contact.repository.js";
import type { ContactDoc, CreateContactInput } from "./contact.types.js";

export const contactService = {
  async sendMessage(input: CreateContactInput): Promise<ContactDoc> {
    const contact: ContactDoc = {
      id: uuid(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    return contactRepository.create(contact);
  },
};
