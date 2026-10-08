export type CategorySlug = "pc" | "monitores" | "teclados" | "mouses" | "audio" | "componentes";

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  /** Claves de `Product.specs` que se ofrecen como filtros en esta categoría. */
  filterKeys: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  /** Precio en USD. */
  price: number;
  stock: number;
  popularity: number;
  isNew: boolean;
  specs: Record<string, string>;
};

export const categories: Category[] = [
  { slug: "pc", name: "PC", description: "Computadoras de escritorio y notebooks", filterKeys: ["RAM", "Almacenamiento", "Procesador"] },
  { slug: "monitores", name: "Monitores", description: "Pantallas para trabajo y gaming", filterKeys: ["Tamaño", "Resolución", "Frecuencia"] },
  { slug: "teclados", name: "Teclados", description: "Mecánicos, inalámbricos y más", filterKeys: ["Tipo", "Conexión"] },
  { slug: "mouses", name: "Mouses", description: "Ergonómicos y gamer", filterKeys: ["Conexión", "DPI"] },
  { slug: "audio", name: "Audio", description: "Auriculares y parlantes", filterKeys: ["Tipo", "Conexión"] },
  { slug: "componentes", name: "Componentes", description: "Procesadores, memorias y almacenamiento", filterKeys: ["Tipo"] },
];

type Seed = [name: string, brand: string, category: CategorySlug, price: number, stock: number, specs: Record<string, string>];

const seeds: Seed[] = [
  ["Notebook Zenith 15", "Asus", "pc", 799, 12, { RAM: "16 GB", Almacenamiento: "512 GB", Procesador: "Ryzen 5" }],
  ["PC Gamer Titan", "MSI", "pc", 1499, 4, { RAM: "32 GB", Almacenamiento: "1 TB", Procesador: "Core i7" }],
  ["Mini PC Nano", "Lenovo", "pc", 429, 30, { RAM: "8 GB", Almacenamiento: "256 GB", Procesador: "Core i3" }],
  ["Notebook Air 14", "HP", "pc", 649, 9, { RAM: "8 GB", Almacenamiento: "512 GB", Procesador: "Ryzen 5" }],
  ["Workstation Pro", "Dell", "pc", 1899, 3, { RAM: "32 GB", Almacenamiento: "1 TB", Procesador: "Core i7" }],
  ["Monitor UltraSharp 27", "Dell", "monitores", 389, 15, { Tamaño: '27"', Resolución: "4K", Frecuencia: "60 Hz" }],
  ["Monitor Odyssey 24", "Samsung", "monitores", 229, 22, { Tamaño: '24"', Resolución: "Full HD", Frecuencia: "165 Hz" }],
  ["Monitor Curvo 32", "LG", "monitores", 449, 6, { Tamaño: '32"', Resolución: "QHD", Frecuencia: "144 Hz" }],
  ["Monitor Office 22", "HP", "monitores", 119, 40, { Tamaño: '22"', Resolución: "Full HD", Frecuencia: "60 Hz" }],
  ["Teclado Mecánico K8", "Logitech", "teclados", 99, 25, { Tipo: "Mecánico", Conexión: "Bluetooth" }],
  ["Teclado Corsair K70", "Corsair", "teclados", 159, 8, { Tipo: "Mecánico", Conexión: "USB" }],
  ["Teclado Slim Silent", "Logitech", "teclados", 39, 50, { Tipo: "Membrana", Conexión: "Inalámbrico" }],
  ["Teclado Redragon Kumara", "Redragon", "teclados", 45, 18, { Tipo: "Mecánico", Conexión: "USB" }],
  ["Mouse MX Master", "Logitech", "mouses", 99, 20, { Conexión: "Bluetooth", DPI: "8000" }],
  ["Mouse Viper Mini", "Razer", "mouses", 49, 14, { Conexión: "USB", DPI: "8500" }],
  ["Mouse G305 Lightspeed", "Logitech", "mouses", 59, 5, { Conexión: "Inalámbrico", DPI: "12000" }],
  ["Mouse Básico M100", "Genius", "mouses", 9, 100, { Conexión: "USB", DPI: "1000" }],
  ["Auriculares Cloud III", "HyperX", "audio", 89, 11, { Tipo: "Headset", Conexión: "USB" }],
  ["Parlantes Stereo 2.0", "Edifier", "audio", 69, 16, { Tipo: "Parlantes", Conexión: "Bluetooth" }],
  ["Procesador Ryzen 7 7700", "AMD", "componentes", 299, 10, { Tipo: "Procesador" }],
  ["Memoria DDR5 32 GB", "Kingston", "componentes", 119, 2, { Tipo: "Memoria RAM" }],
  ["SSD NVMe 1 TB", "Samsung", "componentes", 89, 35, { Tipo: "Almacenamiento" }],
];

export const products: Product[] = seeds.map(([name, brand, category, price, stock, specs], i) => ({
  id: String(i + 1),
  slug: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name,
  brand,
  category,
  price,
  stock,
  popularity: (i * 37) % 100,
  isNew: i % 3 === 0,
  specs,
}));

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: CategorySlug): Product[] {
  return products.filter((p) => p.category === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Productos de la misma categoría, primero los de la misma marca. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => Number(b.brand === product.brand) - Number(a.brand === product.brand) || b.popularity - a.popularity)
    .slice(0, limit);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
