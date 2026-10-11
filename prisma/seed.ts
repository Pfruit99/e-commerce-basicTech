// Carga el catálogo de ejemplo (src/lib/mock-data.ts) en la base. Se ejecuta con `npm run db:seed`.
// Es idempotente: usa upsert por slug y SKU, así que correrlo dos veces no duplica nada
// y vuelve a dejar precio y stock como en el mock.
// Si `.env` define SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD, también crea (o actualiza) ese administrador.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

import { PrismaClient } from "../src/generated/prisma/client";
import { categories, products } from "../src/lib/mock-data";
import { PASSWORD_MAX, PASSWORD_MIN } from "../src/lib/auth-schemas";
import { buildSeedData } from "../src/lib/seed-data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Falta DATABASE_URL. Copia .env.example a .env.");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const data = buildSeedData(categories, products);

  await db.$transaction(async (tx) => {
    const categoryIds = new Map<string, string>();
    for (const { slug, name, description, filterKeys } of data.categories) {
      const c = await tx.category.upsert({
        where: { slug },
        create: { slug, name, description, filterKeys },
        update: { name, description, filterKeys },
      });
      categoryIds.set(slug, c.id);
    }

    const brandIds = new Map<string, string>();
    for (const { slug, name } of data.brands) {
      const b = await tx.brand.upsert({ where: { slug }, create: { slug, name }, update: { name } });
      brandIds.set(slug, b.id);
    }

    for (const p of data.products) {
      const fields = {
        name: p.name,
        popularity: p.popularity,
        isNew: p.isNew,
        specs: p.specs,
        categoryId: categoryIds.get(p.categorySlug)!,
        brandId: brandIds.get(p.brandSlug)!,
      };
      const product = await tx.product.upsert({
        where: { slug: p.slug },
        create: { slug: p.slug, ...fields },
        update: fields,
      });

      const { sku, ...variant } = p.variant;
      await tx.productVariant.upsert({
        where: { sku },
        create: { sku, productId: product.id, ...variant },
        update: { productId: product.id, ...variant },
      });
    }
  });

  console.log(
    `Seed listo: ${data.categories.length} categorías, ${data.brands.length} marcas, ${data.products.length} productos.`,
  );

  await seedAdmin();
}

/**
 * Administrador inicial con la misma forma que crea Better Auth al registrarse: `User` más una `Account`
 * con providerId "credential" y el hash scrypt de la librería. Nunca hay contraseñas en el código.
 */
async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Sin SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD: no se crea administrador.");
    return;
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    throw new Error(`SEED_ADMIN_PASSWORD debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`);
  }

  const name = process.env.SEED_ADMIN_NAME?.trim() || "Administrador";
  const hash = await hashPassword(password);

  await db.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email },
      create: { email, name, role: "ADMIN", status: "ACTIVE", emailVerified: true },
      update: { role: "ADMIN", status: "ACTIVE" },
    });
    const account = await tx.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
    if (account) {
      await tx.account.update({ where: { id: account.id }, data: { password: hash } });
    } else {
      await tx.account.create({ data: { userId: user.id, accountId: user.id, providerId: "credential", password: hash } });
    }
  });

  console.log(`Administrador listo: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
