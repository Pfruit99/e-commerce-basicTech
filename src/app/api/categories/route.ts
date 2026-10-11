import { handler } from "@/lib/api-handler";
import { getCategories } from "@/lib/server/catalog";

export const GET = handler(async () => Response.json({ items: await getCategories() }));
