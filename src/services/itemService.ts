import { db, schema } from "@/db";
import { count, desc, like } from "drizzle-orm";
import { formatItemResponse, getItem, baseitemQuery } from "./itemQueries";
import { byClassId, byItemId, byName, withLike } from "@/utils/queries";
import { baseSnapshotQuery, getSnapshot } from "./snapshotQueries";

export const itemService = {
  async getAllItems({ page = 1, limit = 20, search }: {
    page?: number
    limit?: number
    search?: string
  }) {
    const offset = (page - 1) * limit;

    let query = baseitemQuery();

    if (search) {
      query = withLike(query, search);
    }

    const items = await query
      .orderBy(desc(schema.item.added_at))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: count() })
      .from(schema.item)
      .where(
        search ? like(schema.lower(schema.item.name), `%${search.toLowerCase()}%`)
          : undefined
      );

    const totalItems = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: items.map((item) => formatItemResponse(item)),
      pagination: {
        total: totalItems,
        pages: totalPages,
        page: page,
        limit: limit,
      },
    };
  },

  async getItemByClassId({class_id}: {class_id: number}) {
    return await getItem(byClassId(baseitemQuery(), class_id));
  },
  async getItemById({ item_id }: { item_id: number }) {
    return await getItem(byItemId(baseitemQuery(), item_id));
  },
  async getItemByName({ name }: { name: string }) {
    return await getItem(byName(baseitemQuery(), name));
  },

  async getItemSnapshotByClassId({ class_id }: { class_id: number }) {
    return await getSnapshot(byClassId(baseSnapshotQuery(), class_id));
  },
  async getItemSnapshotById({ item_id }: { item_id: number }) {
    return await getSnapshot(byItemId(baseSnapshotQuery(), item_id));
  },
  async getItemSnapshotByName({ name }: { name: string }) {
    return await getSnapshot(byName(baseSnapshotQuery(), name));
  },
};