import { Contact } from "../../models/Contact.js";
import type { ContactDoc } from "./contact.types.js";

export const contactRepository = {
  async create(contact: ContactDoc): Promise<ContactDoc> {
    await Contact.create({
      ...contact,
      createdAt: new Date(contact.createdAt),
    });
    return contact;
  },
};
