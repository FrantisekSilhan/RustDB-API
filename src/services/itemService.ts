import { db, schema } from "@/db";
import { count, desc, eq, gt, like, sql } from "drizzle-orm";
import { formatItemResponse, getItem, baseitemQuery } from "./itemQueries";
import { byClassId, byItemId, byName, withLike } from "@/utils/queries";
import { baseSnapshotQuery, getOrders, getSnapshot } from "./snapshotQueries";

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

  async getItemOrderBookByClassId({ class_id }: { class_id: number }) {
    const snapshot = await this.getItemSnapshotByClassId({ class_id });
    if (!snapshot) return null;

    const sellOrders = await getOrders(snapshot.snapshot_id, "sell");
    const buyOrders = await getOrders(snapshot.snapshot_id, "buy");

    return {
      snapshot_id: snapshot.snapshot_id,
      fetched_at: snapshot.fetched_at,
      total_sell_requests: snapshot.total_sell_requests,
      total_buy_requests: snapshot.total_buy_requests,
      sell_orders: sellOrders,
      buy_orders: buyOrders,
    };
  },
  async getItemOrderBookById({ item_id }: { item_id: number }) {
    const snapshot = await this.getItemSnapshotById({ item_id });
    if (!snapshot) return null;

    const sellOrders = await getOrders(snapshot.snapshot_id, "sell");
    const buyOrders = await getOrders(snapshot.snapshot_id, "buy");

    return {
      snapshot_id: snapshot.snapshot_id,
      fetched_at: snapshot.fetched_at,
      total_sell_requests: snapshot.total_sell_requests,
      total_buy_requests: snapshot.total_buy_requests,
      sell_orders: sellOrders,
      buy_orders: buyOrders,
    };
  },
  async getItemOrderBookByName({ name }: { name: string }) {
    const snapshot = await this.getItemSnapshotByName({ name });
    if (!snapshot) return null;

    const sellOrders = await getOrders(snapshot.snapshot_id, "sell");
    const buyOrders = await getOrders(snapshot.snapshot_id, "buy");

    return {
      snapshot_id: snapshot.snapshot_id,
      fetched_at: snapshot.fetched_at,
      total_sell_requests: snapshot.total_sell_requests,
      total_buy_requests: snapshot.total_buy_requests,
      sell_orders: sellOrders,
      buy_orders: buyOrders,
    };
  },

  async getRecentItems({ limit = 10 }: { limit?: number }) {
    const query = baseitemQuery()
      .orderBy(desc(schema.item.added_at))
      .limit(limit);

    const items = await query;
    if (!items.length) return null;

    return items.map((item) => formatItemResponse(item));
  },

  async getItemsMinimal() {
    const items = await db
      .select({
        name: schema.item.name,
        icon_url: schema.itemMetadata.icon_url,
      })
      .from(schema.item)
      .innerJoin(
        schema.itemMetadata,
        eq(schema.itemMetadata.item_internal_id, schema.item.internal_id)
      )
      .orderBy(desc(schema.item.added_at));

    const lastItem = (await db
      .select({
        added_at: sql`added_at::text`,
      })
      .from(schema.item)
      .orderBy(desc(schema.item.added_at))
      .limit(1))[0];
    
    if (!items.length || !lastItem) return null;

    return {
      last_item: lastItem.added_at,
      items: items.map((item) => ({
        name: item.name,
        icon: item.icon_url,
      }))
    };
  },

  async getItemsMinimalLast() {
    const lastItem = (await db
      .select({
        added_at: sql`added_at::text`,
      })
      .from(schema.item)
      .orderBy(desc(schema.item.added_at))
      .limit(1))[0];

    if (!lastItem) return null;

    return {
      last_item: lastItem.added_at,
    };
  },

  async getItemsMinimalDiff({ last_item }: { last_item: string }) {
    const items = await db
      .select({
        name: schema.item.name,
        icon_url: schema.itemMetadata.icon_url,
      })
      .from(schema.item)
      .innerJoin(
        schema.itemMetadata,
        eq(schema.itemMetadata.item_internal_id, schema.item.internal_id)
      )
      .where(
        sql`${schema.item.added_at} > ${last_item}::timestamp`
      )
      .orderBy(desc(schema.item.added_at));

    const lastItem = (await db
      .select({
        added_at: sql`added_at::text`,
      })
      .from(schema.item)
      .orderBy(desc(schema.item.added_at))
      .limit(1))[0];

    if (!items.length || !lastItem) return null;

    return {
      from: last_item,
      to: lastItem.added_at,
      items: items.map((item) => ({
        name: item.name,
        icon: item.icon_url,
      }))
    };
  }
};