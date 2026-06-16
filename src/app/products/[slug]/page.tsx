import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/product/ProductDetailView";
import { getProductBySlug, getRelatedProducts, products } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | VELOUR",
    };
  }

  return {
    title: `${product.name} | VELOUR`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailView
      product={product}
      relatedProducts={getRelatedProducts(product.slug)}
    />
  );
}
