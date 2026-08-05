/** Approval status of a review in the moderation queue */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/** Star rating allowed values (1..5) */
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

/** Core review entity returned by the API */
export interface Review {
  _id: string;
  product: string;
  user: string;
  rating: ReviewRating;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  status: ReviewStatus;
  createdAt: Date;
}

/** Payload for creating a new review */
export interface CreateReviewPayload {
  product: string;
  user?: string;
  rating: ReviewRating;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase?: boolean;
}

/** Payload for updating an existing review (partial, _id required) */
export interface UpdateReviewPayload extends Partial<CreateReviewPayload> {
  _id: string;
}

/** Query parameters for listing/searching reviews */
export interface ReviewListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReviewStatus;
  product?: string;
  rating?: ReviewRating;
  isApproved?: boolean;
  isVerifiedPurchase?: boolean;
}

/** Aggregated rating statistics for a product */
export interface ProductRatingSummary {
  product: string;
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<ReviewRating, number>;
}
