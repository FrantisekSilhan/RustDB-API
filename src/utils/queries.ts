import { schema } from "@/db";
import { eq, like } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";

export const withLike = <T extends PgSelect>(query: T, search: string) => {
  return query.where(
    like(schema.lower(schema.item.name), `%${search.toLowerCase()}%`)
  );
};

export const byClassId = <T extends PgSelect>(query: T, class_id: number) => {
  return query.where(
    eq(schema.itemMetadata.class_id, class_id)
  );
};

export const byItemId = <T extends PgSelect>(query: T, item_id: number) => {
  return query.where(
    eq(schema.item.item_id, item_id)
  );
};

export const byName = <T extends PgSelect>(query: T, name: string) => {
  return query.where(
    eq(schema.lower(schema.item.name), name.toLowerCase())
  );
};

export const bySnapshotId = <T extends PgSelect>(query: T, snapshot_id: number) => {
  return query.where(
    eq(schema.itemSnapshot.snapshot_id, snapshot_id)
  );
};