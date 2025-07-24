import { ShoppingItem, ShoppingGroup } from "@shared/schema";

interface BinPackingItem {
  id: string;
  value: number;
  item: ShoppingItem;
}

export class BinPackingAlgorithm {
  /**
   * First Fit Decreasing algorithm for bin packing
   * Sorts items in descending order by value and places each item in the first bin that has enough space
   */
  static firstFitDecreasing(
    items: ShoppingItem[],
    targetAmount: number,
    numberOfGroups: number
  ): ShoppingGroup[] {
    // Sort items by total value in descending order
    const sortedItems: BinPackingItem[] = items
      .map(item => ({
        id: item.id,
        value: item.total,
        item: { ...item }
      }))
      .sort((a, b) => b.value - a.value);

    // Initialize groups
    const groups: ShoppingGroup[] = [];
    for (let i = 0; i < numberOfGroups; i++) {
      groups.push({
        id: `group-${i + 1}`,
        number: i + 1,
        targetAmount,
        total: 0,
        items: []
      });
    }

    // Place each item in the first group that has enough remaining space
    for (const binItem of sortedItems) {
      let placed = false;
      
      // Try to find a group with enough space
      for (const group of groups) {
        if (group.total + binItem.value <= targetAmount * 1.2) { // Allow 20% overflow
          group.items.push(binItem.item);
          group.total = Number((group.total + binItem.value).toFixed(2));
          placed = true;
          break;
        }
      }
      
      // If no group has enough space, place in the group with the least total
      if (!placed) {
        const minGroup = groups.reduce((min, group) => 
          group.total < min.total ? group : min
        );
        minGroup.items.push(binItem.item);
        minGroup.total = Number((minGroup.total + binItem.value).toFixed(2));
      }
    }

    return groups;
  }

  /**
   * Best Fit algorithm for bin packing
   * Places each item in the bin with the least remaining space that can still fit the item
   */
  static bestFit(
    items: ShoppingItem[],
    targetAmount: number,
    numberOfGroups: number
  ): ShoppingGroup[] {
    // Sort items by total value in descending order
    const sortedItems: BinPackingItem[] = items
      .map(item => ({
        id: item.id,
        value: item.total,
        item: { ...item }
      }))
      .sort((a, b) => b.value - a.value);

    // Initialize groups
    const groups: ShoppingGroup[] = [];
    for (let i = 0; i < numberOfGroups; i++) {
      groups.push({
        id: `group-${i + 1}`,
        number: i + 1,
        targetAmount,
        total: 0,
        items: []
      });
    }

    // Place each item in the best fitting group
    for (const binItem of sortedItems) {
      let bestGroup: ShoppingGroup | null = null;
      let bestFit = Infinity;

      // Find the group with the least remaining space that can still fit the item
      for (const group of groups) {
        const remainingSpace = targetAmount - group.total;
        
        if (remainingSpace >= binItem.value && remainingSpace < bestFit) {
          bestFit = remainingSpace;
          bestGroup = group;
        }
      }

      // If no perfect fit found, use the group with the least total
      if (!bestGroup) {
        bestGroup = groups.reduce((min, group) => 
          group.total < min.total ? group : min
        );
      }

      bestGroup.items.push(binItem.item);
      bestGroup.total = Number((bestGroup.total + binItem.value).toFixed(2));
    }

    return groups;
  }

  /**
   * Optimized bin packing that tries both algorithms and returns the best result
   */
  static optimize(
    items: ShoppingItem[],
    targetAmount: number,
    numberOfGroups: number
  ): ShoppingGroup[] {
    if (items.length === 0) {
      return [];
    }

    const ffdResult = this.firstFitDecreasing(items, targetAmount, numberOfGroups);
    const bfResult = this.bestFit(items, targetAmount, numberOfGroups);

    // Calculate total excess for each result
    const ffdExcess = ffdResult.reduce((sum, group) => 
      sum + Math.max(0, group.total - targetAmount), 0
    );
    
    const bfExcess = bfResult.reduce((sum, group) => 
      sum + Math.max(0, group.total - targetAmount), 0
    );

    // Return the result with less total excess
    return ffdExcess <= bfExcess ? ffdResult : bfResult;
  }
}
