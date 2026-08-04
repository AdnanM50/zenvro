export interface Attribute {
  _id: string;
  name: string;
  values: string[];
  isVariant: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAttributePayload {
  name: string;
  values: string[];
  isVariant?: boolean;
}

export interface UpdateAttributePayload extends Partial<CreateAttributePayload> {
  _id: string;
}
