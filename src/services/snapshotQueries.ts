import { db, schema } from "@/db";
import { eq, desc, asc, sql } from "drizzle-orm";

const lowestSellPrice = db
  .select({
    snapshot_id: schema.sellOrderGraph.snapshot_id,
    lowest_sell_price: sql<number | null>`MIN(${schema.sellOrderGraph.price})::BIGINT`.as("lowest_sell_price"),
  })
  .from(schema.sellOrderGraph)
  .groupBy(schema.sellOrderGraph.snapshot_id)
  .as("lowestSellPrice");

const highestBuyPrice = db
  .select({
    snapshot_id: schema.buyOrderGraph.snapshot_id,
    highest_buy_price: sql<number | null>`MAX(${schema.buyOrderGraph.price})::BIGINT`.as("highest_buy_price"),
  })
  .from(schema.buyOrderGraph)
  .groupBy(schema.buyOrderGraph.snapshot_id)
  .as("highestBuyPrice");

export const snapshotSelect = {
  snapshot_id: schema.itemSnapshot.snapshot_id,
  fetched_at: schema.itemSnapshot.fetched_at,
  total_sell_requests: schema.itemSnapshot.total_sell_requests,
  total_buy_requests: schema.itemSnapshot.total_buy_requests,
  lowest_sell_price: lowestSellPrice.lowest_sell_price,
  highest_buy_price: highestBuyPrice.highest_buy_price,
};

export const baseSnapshotQuery = () => (db
  .select(snapshotSelect)
  .from(schema.itemSnapshot)
  .innerJoin(
    schema.item,
    eq(schema.itemSnapshot.item_internal_id, schema.item.internal_id)
  )
  .innerJoin(
    schema.itemMetadata,
    eq(schema.item.internal_id, schema.itemMetadata.item_internal_id)
  )
  .leftJoin(
    lowestSellPrice,
    eq(schema.itemSnapshot.snapshot_id, lowestSellPrice.snapshot_id)
  )
  .leftJoin(
    highestBuyPrice,
    eq(schema.itemSnapshot.snapshot_id, highestBuyPrice.snapshot_id)
  )
  .orderBy(desc(schema.itemSnapshot.fetched_at))
  .$dynamic()
);

export type BaseSnapshotQuery = ReturnType<typeof baseSnapshotQuery>["_"]["result"][0];

export const getSnapshot = async (query: ReturnType<typeof baseSnapshotQuery>): Promise<BaseSnapshotQuery | null> => {
  const snapshot = (await query.limit(1))[0];
  if (!snapshot) return null;

  return snapshot;
};

export const snapshotExists = async (snapshot_id: number): Promise<boolean> => {
  const snapshot = await db
    .select({ exists: eq(schema.itemSnapshot.snapshot_id, snapshot_id) })
    .from(schema.itemSnapshot)
    .where(eq(schema.itemSnapshot.snapshot_id, snapshot_id))
    .limit(1);

  return snapshot.length > 0;
};

export const getOrders = async (snapshot_id: number, orderType: "sell" | "buy") => {
  const orderGraphTable = orderType === "sell" ? schema.sellOrderGraph : schema.buyOrderGraph;

  const orders = await db
    .select({
      price: orderGraphTable.price,
      cumulative_quantity: orderGraphTable.cumulative_quantity,
    })
    .from(orderGraphTable)
    .where(eq(orderGraphTable.snapshot_id, snapshot_id))
    .orderBy(asc(orderGraphTable.cumulative_quantity));

  if (orders.length === 0) return null;

  const formattedOrders = orders.map((order, index) => {
    const quantity = index === 0 ? order.cumulative_quantity : order.cumulative_quantity - orders[index - 1].cumulative_quantity;
    return {
      price: order.price,
      quantity,
      cumulative_quantity: order.cumulative_quantity,
    };
  });

  return formattedOrders;
};