import { db, schema } from "@/db";
import { and, eq, desc } from "drizzle-orm";

export const snapshotSelect = {
  snapshot_id: schema.itemSnapshot.snapshot_id,
  fetched_at: schema.itemSnapshot.fetched_at,
  total_sell_requests: schema.itemSnapshot.total_sell_requests,
  total_buy_requests: schema.itemSnapshot.total_buy_requests,
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
  const orderTable = orderType === "sell" ? schema.sellOrder : schema.buyOrder;
  const orderGraphTable = orderType === "sell" ? schema.sellOrderGraph : schema.buyOrderGraph;

  const orders = await db
    .select({
      price: orderTable.price,
      quantity: orderTable.quantity,
      cumulative_quantity: orderGraphTable.cumulative_quantity,
    })
    .from(orderTable)
    .innerJoin(
      orderGraphTable,
      and(
        eq(orderTable.snapshot_id, orderGraphTable.snapshot_id),
        eq(orderTable.price, orderGraphTable.price),
      ),
    )
    .where(eq(orderTable.snapshot_id, snapshot_id))
    .orderBy(orderTable.price);

  if (orders.length === 0) return null;

  const formattedOrders = orders.map((order) => ({
    price: order.price,
    quantity: order.quantity,
    cumulative_quantity: order.cumulative_quantity,
  }));

  return formattedOrders;
};