export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  quote: string;
  avatar?: string;
  rating: number;
  reviewCount?: number;
  isFeatured?: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestimonialPayload {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdateTestimonialPayload extends Partial<CreateTestimonialPayload> {
  _id: string;
}

export interface TestimonialListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isFeatured?: boolean;
}
