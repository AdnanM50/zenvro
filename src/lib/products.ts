export type ProductReview = {
  name: string;
  rating: number;
  comment: string;
};

export type ProductComment = {
  author: string;
  text: string;
  time: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  year: string;
  price: string;
  rating: string;
  reviewsCount: number;
  tagline: string;
  description: string;
  image: string;
  images: string[];
  color: string;
  material: string;
  fit: string;
  sizes: string[];
  details: string[];
  reviews: ProductReview[];
  comments: ProductComment[];
};

export const products: Product[] = [
  {
    id: 1,
    slug: "olive-urban-shell",
    name: "Olive Urban Shell",
    category: "Weather Jacket",
    year: "2026",
    price: "$186",
    rating: "4.8",
    reviewsCount: 126,
    tagline: "Lean street utility with a quiet matte finish.",
    description:
      "A lightweight outer layer shaped for daily movement, clean silhouettes, and unpredictable city weather.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApqkDG7nrp_PbIMaiExWjRhCV6icWvah6de_G_Gn3rSrWWNk_D0SJonSKh2K9ltLuwEwLJ7l25Web5eiN-dY0hmzeKv_HeieLnWUQ3To4U34O44lzguJC6a_SxfpuHzedpqNicBTPnj6oFgm6BEAgm1fURLpPmC-SxMJGiZr0wIYw_DixMZ3pzJTx1xLj4lpTlwetP_s7LXe7sr9VZxlp_MrJ_SNT3wrpHm5QvALb3TUPZtqqZHYX2nzR3-XI-GEUdxeAwZo5CnFJ5",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApqkDG7nrp_PbIMaiExWjRhCV6icWvah6de_G_Gn3rSrWWNk_D0SJonSKh2K9ltLuwEwLJ7l25Web5eiN-dY0hmzeKv_HeieLnWUQ3To4U34O44lzguJC6a_SxfpuHzedpqNicBTPnj6oFgm6BEAgm1fURLpPmC-SxMJGiZr0wIYw_DixMZ3pzJTx1xLj4lpTlwetP_s7LXe7sr9VZxlp_MrJ_SNT3wrpHm5QvALb3TUPZtqqZHYX2nzR3-XI-GEUdxeAwZo5CnFJ5",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWUkkfOLkPA1s_eOv5emSCzRkDMp1u-bXn3gd1HekVg_oQ0VXGJG2wYICd4X0AUPJc7eSp5KdrYphfl4WnMvx2YTCjKvDbnPLnzy_SND7wqodNIOSsrnHaEXqObVOewcGJnxNQAvGNiUm3_EV7HQglEYIPmiZul0Cxx2MnEvc75IjyGwS-c2ilIQJF6RjFzOhih7b9SDCUhX3DstkoEncM23xxSP_W7aX3aTSMUPtudXC-LSR0LVxvoZpl_kTIabPntTdSLQd9fh8J",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCmCQPxDqEmDCl9pMCnXP-4xFVjMrSM47OhMm03qJTwdIOhnrRPzft-91CzH32mhGZ6D5ofcbGQeX6L6GsZOkFq6ESe9KDiQmKm_EIFuoXK1CkqzhNHGRD7NsCMLqwL204ymZo_VL61OrH4batQwE46rn1fcSdljMsjR2LKf8BIkWmDy2fzDpuvUvFubsZqmhZNQ3zlwTZCThgXzHgt0MnIv8I2wZAPgd0hQwp-kMOYY0_jVTphJ9lrSIsqpY96F5EwN_hVtH2fjUkf",
    ],
    color: "Sage olive",
    material: "Water-resistant cotton blend",
    fit: "Relaxed straight fit",
    sizes: ["XS", "S", "M", "L", "XL"],
    details: ["Hidden storm placket", "Oversized utility pockets", "Soft mesh inner lining"],
    reviews: [
      { name: "Amir", rating: 5, comment: "Looks minimal but feels sturdy. The pockets are excellent." },
      { name: "Sana", rating: 4, comment: "Great everyday jacket, especially over hoodies." },
    ],
    comments: [
      { author: "Noah", text: "Will this return in black?", time: "2 days ago" },
      { author: "Maya", text: "The olive shade is exactly like the photo.", time: "1 week ago" },
    ],
  },
  {
    id: 2,
    slug: "studio-hanger-coat",
    name: "Studio Hanger Coat",
    category: "Workwear Jacket",
    year: "2026",
    price: "$164",
    rating: "4.9",
    reviewsCount: 98,
    tagline: "Simple, structured, and easy to layer.",
    description:
      "A clean workwear-inspired coat with a crisp collar, generous pockets, and a soft drape for everyday styling.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWUkkfOLkPA1s_eOv5emSCzRkDMp1u-bXn3gd1HekVg_oQ0VXGJG2wYICd4X0AUPJc7eSp5KdrYphfl4WnMvx2YTCjKvDbnPLnzy_SND7wqodNIOSsrnHaEXqObVOewcGJnxNQAvGNiUm3_EV7HQglEYIPmiZul0Cxx2MnEvc75IjyGwS-c2ilIQJF6RjFzOhih7b9SDCUhX3DstkoEncM23xxSP_W7aX3aTSMUPtudXC-LSR0LVxvoZpl_kTIabPntTdSLQd9fh8J",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWUkkfOLkPA1s_eOv5emSCzRkDMp1u-bXn3gd1HekVg_oQ0VXGJG2wYICd4X0AUPJc7eSp5KdrYphfl4WnMvx2YTCjKvDbnPLnzy_SND7wqodNIOSsrnHaEXqObVOewcGJnxNQAvGNiUm3_EV7HQglEYIPmiZul0Cxx2MnEvc75IjyGwS-c2ilIQJF6RjFzOhih7b9SDCUhX3DstkoEncM23xxSP_W7aX3aTSMUPtudXC-LSR0LVxvoZpl_kTIabPntTdSLQd9fh8J",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApqkDG7nrp_PbIMaiExWjRhCV6icWvah6de_G_Gn3rSrWWNk_D0SJonSKh2K9ltLuwEwLJ7l25Web5eiN-dY0hmzeKv_HeieLnWUQ3To4U34O44lzguJC6a_SxfpuHzedpqNicBTPnj6oFgm6BEAgm1fURLpPmC-SxMJGiZr0wIYw_DixMZ3pzJTx1xLj4lpTlwetP_s7LXe7sr9VZxlp_MrJ_SNT3wrpHm5QvALb3TUPZtqqZHYX2nzR3-XI-GEUdxeAwZo5CnFJ5",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw-H6Lo7uHeSKQkkehwJ0obz6I87jHbVj4zkYmRhpYZcGseme6lf4Rgdmll6lz06j-oiOYvEIMTbnjze7cAoasqctetYOoRoAy5WDVV00FfXFyPxxhk1XeHI9zxoF9sNhvN-zjtsTBAccW1YtFVaXuXpZMV7r_uzUt7D4I6U9WbUISCZWcmwHq_K_ByL5hHDRo3uB4ZQTA0uFpMncIeTLgwLehGJdsJzQe2y39_CL8BfOVzMH2ruPF80UmCRx1KMCvDO0PNuFXZEHP",
    ],
    color: "Washed charcoal",
    material: "Brushed cotton twill",
    fit: "Boxy cropped fit",
    sizes: ["S", "M", "L", "XL"],
    details: ["Garment washed texture", "Corozo-look buttons", "Reinforced patch pockets"],
    reviews: [
      { name: "Leah", rating: 5, comment: "The shape is perfect, not too oversized." },
      { name: "Zain", rating: 5, comment: "Feels premium and goes with everything." },
    ],
    comments: [
      { author: "Iris", text: "Please make this in navy too.", time: "3 days ago" },
      { author: "Ken", text: "Medium fits true to size for me.", time: "6 days ago" },
    ],
  },
  {
    id: 3,
    slug: "brown-racer-leather",
    name: "Brown Racer Leather",
    category: "Leather Jacket",
    year: "2026",
    price: "$328",
    rating: "4.9",
    reviewsCount: 214,
    tagline: "The piece that makes the whole outfit sharper.",
    description:
      "A polished racer jacket built from supple faux leather with a close collar, balanced shine, and refined hardware.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCmCQPxDqEmDCl9pMCnXP-4xFVjMrSM47OhMm03qJTwdIOhnrRPzft-91CzH32mhGZ6D5ofcbGQeX6L6GsZOkFq6ESe9KDiQmKm_EIFuoXK1CkqzhNHGRD7NsCMLqwL204ymZo_VL61OrH4batQwE46rn1fcSdljMsjR2LKf8BIkWmDy2fzDpuvUvFubsZqmhZNQ3zlwTZCThgXzHgt0MnIv8I2wZAPgd0hQwp-kMOYY0_jVTphJ9lrSIsqpY96F5EwN_hVtH2fjUkf",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCmCQPxDqEmDCl9pMCnXP-4xFVjMrSM47OhMm03qJTwdIOhnrRPzft-91CzH32mhGZ6D5ofcbGQeX6L6GsZOkFq6ESe9KDiQmKm_EIFuoXK1CkqzhNHGRD7NsCMLqwL204ymZo_VL61OrH4batQwE46rn1fcSdljMsjR2LKf8BIkWmDy2fzDpuvUvFubsZqmhZNQ3zlwTZCThgXzHgt0MnIv8I2wZAPgd0hQwp-kMOYY0_jVTphJ9lrSIsqpY96F5EwN_hVtH2fjUkf",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw-H6Lo7uHeSKQkkehwJ0obz6I87jHbVj4zkYmRhpYZcGseme6lf4Rgdmll6lz06j-oiOYvEIMTbnjze7cAoasqctetYOoRoAy5WDVV00FfXFyPxxhk1XeHI9zxoF9sNhvN-zjtsTBAccW1YtFVaXuXpZMV7r_uzUt7D4I6U9WbUISCZWcmwHq_K_ByL5hHDRo3uB4ZQTA0uFpMncIeTLgwLehGJdsJzQe2y39_CL8BfOVzMH2ruPF80UmCRx1KMCvDO0PNuFXZEHP",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWUkkfOLkPA1s_eOv5emSCzRkDMp1u-bXn3gd1HekVg_oQ0VXGJG2wYICd4X0AUPJc7eSp5KdrYphfl4WnMvx2YTCjKvDbnPLnzy_SND7wqodNIOSsrnHaEXqObVOewcGJnxNQAvGNiUm3_EV7HQglEYIPmiZul0Cxx2MnEvc75IjyGwS-c2ilIQJF6RjFzOhih7b9SDCUhX3DstkoEncM23xxSP_W7aX3aTSMUPtudXC-LSR0LVxvoZpl_kTIabPntTdSLQd9fh8J",
    ],
    color: "Dark walnut",
    material: "Premium faux leather",
    fit: "Tailored regular fit",
    sizes: ["XS", "S", "M", "L", "XL"],
    details: ["Snap-tab racer collar", "Antique metal zipper", "Angled zip pockets"],
    reviews: [
      { name: "Eli", rating: 5, comment: "Instant favorite. The collar and zipper details look expensive." },
      { name: "Rhea", rating: 5, comment: "The brown tone is rich without looking too glossy." },
    ],
    comments: [
      { author: "Omar", text: "How warm is this for winter layering?", time: "1 day ago" },
      { author: "June", text: "Bought it last week and the fit is clean.", time: "4 days ago" },
    ],
  },
  {
    id: 4,
    slug: "black-cloud-puffer",
    name: "Black Cloud Puffer",
    category: "Puffer Jacket",
    year: "2026",
    price: "$212",
    rating: "4.7",
    reviewsCount: 142,
    tagline: "Soft volume with a sharp city outline.",
    description:
      "A high-collar puffer with plush insulation, satin-matte finish, and a cropped proportion that keeps the look modern.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw-H6Lo7uHeSKQkkehwJ0obz6I87jHbVj4zkYmRhpYZcGseme6lf4Rgdmll6lz06j-oiOYvEIMTbnjze7cAoasqctetYOoRoAy5WDVV00FfXFyPxxhk1XeHI9zxoF9sNhvN-zjtsTBAccW1YtFVaXuXpZMV7r_uzUt7D4I6U9WbUISCZWcmwHq_K_ByL5hHDRo3uB4ZQTA0uFpMncIeTLgwLehGJdsJzQe2y39_CL8BfOVzMH2ruPF80UmCRx1KMCvDO0PNuFXZEHP",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw-H6Lo7uHeSKQkkehwJ0obz6I87jHbVj4zkYmRhpYZcGseme6lf4Rgdmll6lz06j-oiOYvEIMTbnjze7cAoasqctetYOoRoAy5WDVV00FfXFyPxxhk1XeHI9zxoF9sNhvN-zjtsTBAccW1YtFVaXuXpZMV7r_uzUt7D4I6U9WbUISCZWcmwHq_K_ByL5hHDRo3uB4ZQTA0uFpMncIeTLgwLehGJdsJzQe2y39_CL8BfOVzMH2ruPF80UmCRx1KMCvDO0PNuFXZEHP",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCmCQPxDqEmDCl9pMCnXP-4xFVjMrSM47OhMm03qJTwdIOhnrRPzft-91CzH32mhGZ6D5ofcbGQeX6L6GsZOkFq6ESe9KDiQmKm_EIFuoXK1CkqzhNHGRD7NsCMLqwL204ymZo_VL61OrH4batQwE46rn1fcSdljMsjR2LKf8BIkWmDy2fzDpuvUvFubsZqmhZNQ3zlwTZCThgXzHgt0MnIv8I2wZAPgd0hQwp-kMOYY0_jVTphJ9lrSIsqpY96F5EwN_hVtH2fjUkf",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApqkDG7nrp_PbIMaiExWjRhCV6icWvah6de_G_Gn3rSrWWNk_D0SJonSKh2K9ltLuwEwLJ7l25Web5eiN-dY0hmzeKv_HeieLnWUQ3To4U34O44lzguJC6a_SxfpuHzedpqNicBTPnj6oFgm6BEAgm1fURLpPmC-SxMJGiZr0wIYw_DixMZ3pzJTx1xLj4lpTlwetP_s7LXe7sr9VZxlp_MrJ_SNT3wrpHm5QvALb3TUPZtqqZHYX2nzR3-XI-GEUdxeAwZo5CnFJ5",
    ],
    color: "Deep black",
    material: "Recycled poly shell",
    fit: "Cropped relaxed fit",
    sizes: ["XS", "S", "M", "L"],
    details: ["High padded collar", "Snap front closure", "Elasticated cuffs"],
    reviews: [
      { name: "Talia", rating: 5, comment: "Warm but still stylish. The collar is my favorite part." },
      { name: "Ben", rating: 4, comment: "Good volume and very comfortable." },
    ],
    comments: [
      { author: "Nina", text: "Does this pack down for travel?", time: "5 hours ago" },
      { author: "Ash", text: "The cropped length works well with wide pants.", time: "2 weeks ago" },
    ],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(slug: string) {
  return products.filter((product) => product.slug !== slug).slice(0, 3);
}
