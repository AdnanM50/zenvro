export type PageStatus = 'published' | 'draft';

export type SectionType =
  | 'hero'
  | 'richText'
  | 'missionVision'
  | 'contactInfo'
  | 'policyClauses'
  | 'featuresGrid'
  | 'faq';

export interface PageSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export interface PageSEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Page {
  _id: string;
  title: string;
  slug: string;
  status: PageStatus;
  sections: PageSection[];
  seo: PageSEO;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePagePayload {
  title: string;
  slug?: string;
  status?: PageStatus;
  sections?: PageSection[];
  seo?: Partial<PageSEO>;
}

export interface UpdatePagePayload {
  _id: string;
  title?: string;
  slug?: string;
  status?: PageStatus;
  sections?: PageSection[];
  seo?: Partial<PageSEO>;
}

export interface PageListParams {
  search?: string;
  status?: PageStatus;
  page?: number;
  limit?: number;
}
