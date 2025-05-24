import { db, schema } from "@/db";
import { count, desc, eq, like, sql } from "drizzle-orm";
import { formatItemResponse, getItem, baseitemQuery } from "./itemQueries";
import { byClassId, byItemId, byName, withLike } from "@/utils/queries";
import { getOrders } from "./snapshotQueries";

export type SnapshotRow = {
  id: number;
  fetched_at: string;
  total_sell_requests: number;
  total_buy_requests: number;
  lowest_sell_price: number | null;
  highest_buy_price: number | null;
};

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
    const result = (await db.execute<SnapshotRow>(sql`
      WITH relevant_snapshots AS (
        SELECT s.id, s.fetched_at, s.total_sell_requests, s.total_buy_requests
        FROM item_snapshots s
        JOIN items i ON s.item_internal_id = i.internal_id
        JOIN item_metadata im ON i.internal_id = im.item_internal_id
        WHERE im.class_id = ${class_id}
      ),
      lowest_sell_price AS (
        SELECT item_snapshot_id, MIN(price)::INTEGER AS lowest_sell_price
        FROM sell_order_graphs
        WHERE item_snapshot_id IN (SELECT id FROM relevant_snapshots)
        GROUP BY item_snapshot_id
      ),
      highest_buy_price AS (
        SELECT item_snapshot_id, MAX(price)::INTEGER AS highest_buy_price
        FROM buy_order_graphs
        WHERE item_snapshot_id IN (SELECT id FROM relevant_snapshots)
        GROUP BY item_snapshot_id
      )
      SELECT
        rs.id,
        rs.fetched_at,
        rs.total_sell_requests,
        rs.total_buy_requests,
        lsp.lowest_sell_price,
        hbp.highest_buy_price
      FROM relevant_snapshots rs
      LEFT JOIN lowest_sell_price lsp ON rs.id = lsp.item_snapshot_id
      LEFT JOIN highest_buy_price hbp ON rs.id = hbp.item_snapshot_id
      ORDER BY rs.fetched_at DESC
      LIMIT 1;
    `)).rows[0];

    if (!result) return null;

    return {
      snapshot_id: result.id,
      fetched_at: result.fetched_at,
      total_sell_requests: result.total_sell_requests,
      total_buy_requests: result.total_buy_requests,
      lowest_sell_price: result.lowest_sell_price,
      highest_buy_price: result.highest_buy_price,
    };
  },
  async getItemSnapshotById({ item_id }: { item_id: number }) {
    const result = (await db.execute<SnapshotRow>(sql`
      WITH relevant_snapshots AS (
        SELECT s.id, s.fetched_at, s.total_sell_requests, s.total_buy_requests
        FROM item_snapshots s
        JOIN items i ON s.item_internal_id = i.internal_id
        WHERE i.item_id = ${item_id}
      ),
      lowest_sell_price AS (
        SELECT item_snapshot_id, MIN(price)::INTEGER AS lowest_sell_price
        FROM sell_order_graphs
        WHERE item_snapshot_id IN (SELECT id FROM relevant_snapshots)
        GROUP BY item_snapshot_id
      ),
      highest_buy_price AS (
        SELECT item_snapshot_id, MAX(price)::INTEGER AS highest_buy_price
        FROM buy_order_graphs
        WHERE item_snapshot_id IN (SELECT id FROM relevant_snapshots)
        GROUP BY item_snapshot_id
      )
      SELECT
        rs.id,
        rs.fetched_at,
        rs.total_sell_requests,
        rs.total_buy_requests,
        lsp.lowest_sell_price,
        hbp.highest_buy_price
      FROM relevant_snapshots rs
      LEFT JOIN lowest_sell_price lsp ON rs.id = lsp.item_snapshot_id
      LEFT JOIN highest_buy_price hbp ON rs.id = hbp.item_snapshot_id
      ORDER BY rs.fetched_at DESC
      LIMIT 1;
    `)).rows[0];

    if (!result) return null;

    return {
      snapshot_id: result.id,
      fetched_at: result.fetched_at,
      total_sell_requests: result.total_sell_requests,
      total_buy_requests: result.total_buy_requests,
      lowest_sell_price: result.lowest_sell_price,
      highest_buy_price: result.highest_buy_price,
    };
  },
  async getItemSnapshotByName({ name }: { name: string }) {
    const result = (await db.execute<SnapshotRow>(sql`
      WITH relevant_snapshots AS (
        SELECT s.id, s.fetched_at, s.total_sell_requests, s.total_buy_requests
        FROM item_snapshots s
        JOIN items i ON s.item_internal_id = i.internal_id
        WHERE LOWER(i.name) = LOWER(${name})
      ),
      lowest_sell_price AS (
        SELECT item_snapshot_id, MIN(price)::INTEGER AS lowest_sell_price
        FROM sell_order_graphs
        WHERE item_snapshot_id IN (SELECT id FROM relevant_snapshots)
        GROUP BY item_snapshot_id
      ),
      highest_buy_price AS (
        SELECT item_snapshot_id, MAX(price)::INTEGER AS highest_buy_price
        FROM buy_order_graphs
        WHERE item_snapshot_id IN (SELECT id FROM relevant_snapshots)
        GROUP BY item_snapshot_id
      )
      SELECT
        rs.id,
        rs.fetched_at,
        rs.total_sell_requests,
        rs.total_buy_requests,
        lsp.lowest_sell_price,
        hbp.highest_buy_price
      FROM relevant_snapshots rs
      LEFT JOIN lowest_sell_price lsp ON rs.id = lsp.item_snapshot_id
      LEFT JOIN highest_buy_price hbp ON rs.id = hbp.item_snapshot_id
      ORDER BY rs.fetched_at DESC
      LIMIT 1;
    `)).rows[0];

    if (!result) return null;

    return {
      snapshot_id: result.id,
      fetched_at: result.fetched_at,
      total_sell_requests: result.total_sell_requests,
      total_buy_requests: result.total_buy_requests,
      lowest_sell_price: result.lowest_sell_price,
      highest_buy_price: result.highest_buy_price,
    };
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
        added_at: sql<string>`added_at::text`,
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
        added_at: sql<string>`added_at::text`,
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
        added_at: sql<string>`added_at::text`,
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