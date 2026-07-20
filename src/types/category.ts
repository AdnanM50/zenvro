export interface CategorySEO {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogImage: string;
  robots: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: string;
  image: string;
  description: string;
  seo: CategorySEO;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  parentCategory: string;
  image: string;
  description: string;
  seo: CategorySEO;
  isActive: boolean;
}

export const defaultCategorySEO: CategorySEO = {
  title: '',
  description: '',
  keywords: [],
  canonical: '',
  ogImage: '',
  robots: 'index',
};

export const emptyCategoryForm: CategoryFormData = {
  name: '',
  slug: '',
  parentCategory: '',
  image: '',
  description: '',
  seo: { ...defaultCategorySEO },
  isActive: true,
};
