import type { NextRequest } from "next/server";

import { handler } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { getProductBySlug } from "@/lib/server/catalog";

export const GET = handler(async (_req: NextRequest, ctx: RouteContext<"/api/products/[slug]">) => {
  const { slug } = await ctx.params;
  const product = await getProductBySlug(slug);
  if (!product) throw new AppError("NOT_FOUND", "Producto no encontrado.");
  return Response.json(product);
});
