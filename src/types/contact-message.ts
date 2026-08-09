export type ContactMessageStatus = 'new' | 'answered';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  isRegistered: boolean;
  status: ContactMessageStatus;
  reply?: string;
  repliedAt?: Date;
  repliedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactMessagePayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  userId?: string;
  isRegistered?: boolean;
}

export interface UpdateContactMessagePayload {
  _id: string;
  status?: ContactMessageStatus;
  reply?: string;
}

export interface ContactMessageListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactMessageStatus;
}

export interface ContactMessageStats {
  total: number;
  new: number;
  answered: number;
  registered: number;
  guest: number;
}
