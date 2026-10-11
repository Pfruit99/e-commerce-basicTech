import type { NextRequest } from "next/server";

import { handler } from "@/lib/api-handler";
import { parseIds, parseProductQuery } from "@/lib/catalog-api";
import { getProductsByIds, listProducts } from "@/lib/server/catalog";

/**
 * `GET /api/products?ids=a,b` devuelve esos productos (`{ items }`), para el carrito y los favoritos.
 * Sin `ids`, devuelve el listado filtrado y paginado (`{ items, total, page, pageSize }`).
 */
export const GET = handler(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const ids = parseIds(params);
  if (ids) return Response.json({ items: await getProductsByIds(ids) });
  return Response.json(await listProducts(parseProductQuery(params)));
});
