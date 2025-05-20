import { eq, like } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import { schema, db } from "@/db";

export const itemUrl = "https://community.fastly.steamstatic.com/economy/image/";

export const itemSelect = {
  name: schema.item.name,
  item_id: schema.item.item_id,
  added_at: schema.item.added_at,
  background_color: schema.itemMetadata.background_color,
  icon_url: schema.itemMetadata.icon_url,
  class_id: schema.itemMetadata.class_id,
};

export const baseitemQuery = () => (db
  .select(itemSelect)
  .from(schema.itemMetadata)
  .innerJoin(
    schema.item,
    eq(schema.itemMetadata.item_internal_id, schema.item.internal_id)
  )
  .$dynamic()
);

export type BaseItemQuery = ReturnType<typeof baseitemQuery>["_"]["result"][0];

export interface FormattedItemResponse extends BaseItemQuery {
  full_icon_url: string | null;
};

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

export const formatItemResponse = (item: BaseItemQuery): FormattedItemResponse => {
  return {
    ...item,
    full_icon_url: item.icon_url
      ? `${itemUrl}${item.icon_url}`
      : null,
  };
};

export const getItem = async (query: ReturnType<typeof baseitemQuery>): Promise<FormattedItemResponse | null> => {
  const item = (await query.limit(1))[0];
  if (!item) return null;

  return formatItemResponse(item);
};