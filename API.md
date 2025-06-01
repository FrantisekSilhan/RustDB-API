# Rust Item Market API

A public API for Rust game items, providing historical Steam Marketplace data, order books, and item metadata.  
All endpoints are under `/api/v1/`.

---

## **Endpoints**

---

### **Items**

#### **GET `/api/v1/items`**

List all items, with pagination and optional search.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20, max: 250)
- `search` (string, optional) — search by item name

**Response:**
```json
{
  "items": [
    {
      "name": "Item Name",
      "item_id": 123456789,
      "added_at": "2024-05-22T12:00:00.000Z",
      "background_color": "000000",
      "icon_url": "icon_id",
      "class_id": 987654321,
      "full_icon_url": "https://community.fastly.steamstatic.com/economy/image/icon_id"
    }
    // ...
  ],
  "pagination": {
    "total": 123,
    "pages": 7,
    "page": 1,
    "limit": 20
  }
}
```

---

#### **GET `/api/v1/items/recent`**

List the most recently added items.

**Query Parameters:**
- `limit` (number, optional, default: 10, min: 1, max: 50) — number of recent items to return

**Response:**
```json
{
  "items": [
    {
      "name": "Item Name",
      "item_id": 123456789,
      "added_at": "2024-05-22T12:00:00.000Z",
      "background_color": "000000",
      "icon_url": "icon_id",
      "class_id": 987654321,
      "full_icon_url": "https://community.fastly.steamstatic.com/economy/image/icon_id"
    }
    // ...
  ]
}
```

---

#### **GET `/api/v1/items/item-id/:item_id`**

#### **GET `/api/v1/items/class-id/:class_id`**

#### **GET `/api/v1/items/name/:name`**

Get metadata for a specific item by its identifier.

**Response:**
```json
{
  "name": "Item Name",
  "item_id": 123456789,
  "added_at": "2024-05-22T12:00:00.000Z",
  "background_color": "000000",
  "icon_url": "icon_id",
  "class_id": 987654321,
  "full_icon_url": "https://community.fastly.steamstatic.com/economy/image/icon_id"
}
```

---

### **Minimal Items Endpoints**

Endpoints for efficient client-side search, preview, and incremental updates.

#### **GET `/api/v1/items/minimal`**

Returns a minimal list of all items, suitable for client-side search and preview.

**Response:**
```json
{
  "last_item": "2024-05-22T12:00:00.00000Z",
  "items": [
    { "name": "Item 1", "icon": "icon_1" },
    { "name": "Item 2", "icon": "icon_2" }
    // ...
  ]
}
```

---

#### **GET `/api/v1/items/minimal/last`**

Returns only the timestamp of the most recently added item.

**Response:**
```json
{
  "last_item": "2024-05-22T12:00:00.00000Z"
}
```

---

#### **GET `/api/v1/items/minimal/diff`**

Returns only the items added from the last date (for incremental updates).

**Query Parameters:**
- `from` (ISO date string, required): The timestamp of the last item the client has.

**Response:**
```json
{
  "from": "2024-05-01T00:00:00.00000Z",
  "to": "2024-05-22T12:00:00.00000Z",
  "items": [
    { "name": "New Item 1", "icon": "icon_123" },
    { "name": "New Item 2", "icon": "icon_456" }
    // ...
  ]
}
```

---

### **Get Latest Snapshot for an Item**

Get the most recent snapshot metadata for an item by any of its identifiers.

#### **GET `/api/v1/items/item-id/:item_id/snapshot`**

#### **GET `/api/v1/items/class-id/:class_id/snapshot`**

#### **GET `/api/v1/items/name/:name/snapshot`**

**Response:**
```json
{
  "snapshot_id": 123,
  "fetched_at": "2024-05-22T12:00:00.000Z",
  "total_sell_requests": 19,
  "total_buy_requests": 274,
  "lowest_sell_price": 654,
  "highest_buy_price": 456
}
```

---

### **Get Latest Order Book for an Item**

Get the most recent order book (buy and sell orders, including cumulative quantities) for an item, using any of its identifiers.

#### **GET `/api/v1/items/item-id/:item_id/orderbook`**

#### **GET `/api/v1/items/class-id/:class_id/orderbook`**

#### **GET `/api/v1/items/name/:name/orderbook`**

**Response:**
```json
{
  "snapshot_id": 123,
  "fetched_at": "2024-05-22T12:00:00.000Z",
  "total_sell_requests": 2,
  "total_buy_requests": 7,
  "sell_orders": [
    {
      "price": 1622,
      "quantity": 1,
      "cumulative_quantity": 1
    },
    {
      "price": 1624,
      "quantity": 1,
      "cumulative_quantity": 2
    }
    // ...
  ],
  "buy_orders": [
    {
      "price": 1366,
      "quantity": 6,
      "cumulative_quantity": 6
    },
    {
      "price": 1325,
      "quantity": 1,
      "cumulative_quantity": 7
    }
    // ...
  ]
}
```

---

### **Snapshots**

#### **GET `/api/v1/snapshots/:snapshot_id`**

Get the order book (buy and sell orders) for a specific snapshot.

**Response:**
```json
{
  "sell_orders": [
    {
      "price": 1622,
      "quantity": 1,
      "cumulative_quantity": 1
    },
    {
      "price": 1624,
      "quantity": 1,
      "cumulative_quantity": 2
    }
    // ...
  ],
  "buy_orders": [
    {
      "price": 1366,
      "quantity": 6,
      "cumulative_quantity": 6
    },
    {
      "price": 1325,
      "quantity": 1,
      "cumulative_quantity": 7
    }
    // ...
  ]
}
```

---

## Database Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_items_lower_name ON items (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_sell_order_graphs_snapshot_id_desc ON sell_order_graphs (item_snapshot_id DESC);
CREATE INDEX IF NOT EXISTS idx_buy_order_graphs_snapshot_id_desc ON buy_order_graphs (item_snapshot_id DESC);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_items_name_trgm ON items USING gin (LOWER(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_item_metadata_class_id ON item_metadata (class_id);
CREATE INDEX IF NOT EXISTS idx_items_item_id ON items (item_id);
CREATE INDEX IF NOT EXISTS idx_item_snapshots_id ON item_snapshots (id);

CREATE INDEX IF NOT EXISTS idx_sell_order_graphs_item_snapshot_id_price ON sell_order_graphs (item_snapshot_id, price);
CREATE INDEX IF NOT EXISTS idx_buy_order_graphs_item_snapshot_id_price ON buy_order_graphs (item_snapshot_id, price);
```

--

## **ID Reference**

- **item_id**: Steam's unique item ID (requires scraping to obtain from Steam)
- **class_id**: Steam's class ID (available from Steam API)
- **name**: Item name (unique)

---

## **Notes**

- All prices are in the smallest currency unit (e.g., cents).
- All endpoints return data in JSON.
- Pagination is available for item lists.
- Snapshots represent the state of the order book at a specific time.

---

## **Planned/Upcoming Endpoints**

- List all snapshots for an item
- Get price history for an item

---

## **Questions or Feedback**

If you have questions, suggestions, or want to see more features, feel free to reach out!  

Enjoy exploring the data!
