export interface Tag {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagPayload {
  name: string;
  slug?: string;
}

export interface UpdateTagPayload {
  _id: string;
  name?: string;
  slug?: string;
}
