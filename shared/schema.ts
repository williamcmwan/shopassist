import { z } from "zod";

export const shoppingItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  price: z.number().min(0, "Price must be positive"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  total: z.number(),
  groupId: z.string().optional(),
  originalQuantity: z.number().optional(), // Store original quantity for splitting
  splitIndex: z.number().optional(), // For tracking which part of split item (1-based)
});

export const shoppingGroupSchema = z.object({
  id: z.string(),
  number: z.number(),
  targetAmount: z.number(),
  total: z.number(),
  items: z.array(shoppingItemSchema),
});

export const shoppingListSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "List name is required"),
  date: z.string(),
  items: z.array(shoppingItemSchema),
  groups: z.array(shoppingGroupSchema).optional(),
  total: z.number(),
  isSplitMode: z.boolean().default(false),
});

export type ShoppingItem = z.infer<typeof shoppingItemSchema>;
export type ShoppingGroup = z.infer<typeof shoppingGroupSchema>;
export type ShoppingList = z.infer<typeof shoppingListSchema>;

export const insertShoppingItemSchema = shoppingItemSchema.omit({
  id: true,
  total: true,
});

export const insertShoppingListSchema = shoppingListSchema.omit({
  id: true,
  total: true,
  items: true,
  groups: true,
});

export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
