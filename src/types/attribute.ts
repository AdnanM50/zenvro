export interface Attribute {
  _id: string;
  name: string;
  values: string[];
  useForVariants: boolean;
  isVariant?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAttributePayload {
  name: string;
  values: string[];
  useForVariants?: boolean;
  isVariant?: boolean;
}

export interface UpdateAttributePayload extends Partial<CreateAttributePayload> {
  _id: string;
}
