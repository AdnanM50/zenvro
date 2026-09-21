import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/product/ProductDetailView";
import { ProductModel } from "@/models/product.model";
import { CategoryModel } from "@/models/category.model";
import { TagModel } from "@/models/tag.model";
import {
  getProductBySlug,
  getRelatedProducts,
  formatProductForUI,
  products as fallbackProducts,
  type Product as UIProduct,
} from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const { products: dbProducts } = await ProductModel.findPaginated(1, 100, {
      status: "published",
    });
    const slugs = dbProducts.map((p) => ({ slug: p.slug }));
    const fallbackSlugs = fallbackProducts.map((p) => ({ slug: p.slug }));
    return [...slugs, ...fallbackSlugs];
  } catch {
    return fallbackProducts.map((product) => ({
      slug: product.slug,
    }));
  }
}

async function fetchProductAndRelated(slug: string): Promise<{
  product: UIProduct | null;
  relatedProducts: UIProduct[];
}> {
  try {
    let categoryMap: Record<string, string> = {};
    try {
      const cats = await CategoryModel.findAll();
      cats.forEach((c) => {
        if (c._id) categoryMap[c._id] = c.name;
        if (c.slug) categoryMap[c.slug] = c.name;
      });
    } catch {}

    let tagMap: Record<string, string> = {};
    try {
      const tags = await TagModel.findAll();
      tags.forEach((t) => {
        if (t._id) tagMap[t._id] = t.name;
        if (t.slug) tagMap[t.slug] = t.name;
        if (t.name) tagMap[t.name] = t.name;
      });
    } catch {}

    let dbProduct = await ProductModel.findBySlug(slug);
    if (!dbProduct) {
      dbProduct = await ProductModel.findById(slug);
    }

    if (dbProduct && dbProduct.status === "published") {
      const formatted = formatProductForUI(JSON.parse(JSON.stringify(dbProduct)), categoryMap, tagMap);

      // Fetch related published products from same category
      const catResult = await ProductModel.findPaginated(1, 10, {
        category: dbProduct.category,
        status: "published",
      });
      const categoryProducts = catResult?.products || [];

      const relatedRaw = categoryProducts
        .filter((p) => p._id !== dbProduct._id && p.slug !== dbProduct.slug)
        .slice(0, 3);

      let formattedRelated = relatedRaw.map((p) =>
        formatProductForUI(JSON.parse(JSON.stringify(p)), categoryMap, tagMap)
      );

      if (formattedRelated.length < 3) {
        const fallbackRelated = getRelatedProducts(slug);
        formattedRelated = [...formattedRelated, ...fallbackRelated].slice(0, 3);
      }

      return {
        product: formatted,
        relatedProducts: formattedRelated,
      };
    }
  } catch (error) {
    console.error("Fetch DB product error:", error);
  }


  // Fallback to static mock product list if DB doesn't have this slug
  const fallback = getProductBySlug(slug);
  if (fallback) {
    return {
      product: fallback,
      relatedProducts: getRelatedProducts(slug),
    };
  }

  return { product: null, relatedProducts: [] };
}

import { generateProductMetadata, ProductJsonLd, BreadcrumbJsonLd } from "@/seo";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const dbProduct = await ProductModel.findBySlug(slug) || await ProductModel.findById(slug);
    if (dbProduct) {
      return generateProductMetadata(JSON.parse(JSON.stringify(dbProduct)));
    }
  } catch {}

  const { product } = await fetchProductAndRelated(slug);
  if (!product) {
    return {
      title: "Product Not Found | VELOUR",
      robots: { index: false, follow: false },
    };
  }

  return generateProductMetadata({
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0,
    images: product.images?.length ? product.images : [product.image],
    status: 'published',
    category: product.category,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { product, relatedProducts } = await fetchProductAndRelated(slug);

  if (!product) {
    notFound();
  }

  const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
  const numericRating = parseFloat(product.rating) || 4.8;
  const productImages = product.images?.length ? product.images : [product.image];

  return (
    <>
      {/* Schema.org Product Structured Data for SERP Rich Badges */}
      <ProductJsonLd
        name={product.name}
        description={product.shortDescription || product.description}
        images={productImages}
        price={numericPrice}
        currency="USD"
        sku={String(product.id || product.slug)}
        category={product.category}
        ratingValue={numericRating}
        reviewCount={product.reviewsCount || 1}
        availability="InStock"
        url={`/products/${product.slug}`}
      />

      {/* Schema.org Breadcrumbs */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: product.category, url: `/categories/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
          { name: product.name, url: `/products/${product.slug}` },
        ]}
      />

      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}

