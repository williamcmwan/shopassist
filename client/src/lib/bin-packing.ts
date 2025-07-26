import { ShoppingItem, ShoppingGroup } from "@shared/schema";

interface BinPackingItem {
  id: string;
  value: number;
  item: ShoppingItem;
}

export interface GroupSpec {
  targetAmount: number;
  count: number;
}

export class BinPackingAlgorithm {
  /**
   * First Fit Decreasing algorithm for bin packing
   * Sorts items in descending order by value and places each item in the first bin that has enough space
   * Can split items with multiple quantities across different groups
   */
  static firstFitDecreasing(
    items: ShoppingItem[],
    targetAmount: number,
    numberOfGroups: number
  ): ShoppingGroup[] {
    // Create individual units from items with quantities > 1
    const individualItems: BinPackingItem[] = [];
    
    items.forEach(item => {
      const unitPrice = item.price;
      for (let i = 0; i < item.quantity; i++) {
        individualItems.push({
          id: `${item.id}-${i}`,
          value: unitPrice,
          item: {
            ...item,
            id: `${item.id}-${i}`,
            quantity: 1,
            total: unitPrice,
            originalQuantity: item.quantity,
            splitIndex: i + 1 // Add 1-based index for display
          }
        });
      }
    });

    // Sort items by total value in descending order
    const sortedItems = individualItems.sort((a, b) => b.value - a.value);

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
   * Can split items with multiple quantities across different groups
   */
  static bestFit(
    items: ShoppingItem[],
    targetAmount: number,
    numberOfGroups: number
  ): ShoppingGroup[] {
    // Create individual units from items with quantities > 1
    const individualItems: BinPackingItem[] = [];
    
    items.forEach(item => {
      const unitPrice = item.price;
      for (let i = 0; i < item.quantity; i++) {
        individualItems.push({
          id: `${item.id}-${i}`,
          value: unitPrice,
          item: {
            ...item,
            id: `${item.id}-${i}`,
            quantity: 1,
            total: unitPrice,
            originalQuantity: item.quantity,
            splitIndex: i + 1 // Add 1-based index for display
          }
        });
      }
    });

    // Sort items by total value in descending order
    const sortedItems = individualItems.sort((a, b) => b.value - a.value);

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

  static optimizeMultiple(
    items: ShoppingItem[],
    groupSpecs: GroupSpec[]
  ): ShoppingGroup[] {
    // Flatten group specs into an array of {targetAmount, groupIndex}
    const groupTargets: { targetAmount: number; groupIndex: number }[] = [];
    groupSpecs.forEach((spec, i) => {
      for (let j = 0; j < spec.count; j++) {
        groupTargets.push({ targetAmount: spec.targetAmount, groupIndex: groupTargets.length });
      }
    });
    // Create groups
    const groups: ShoppingGroup[] = groupTargets.map((g, i) => ({
      id: `group-${i + 1}`,
      number: i + 1,
      targetAmount: g.targetAmount,
      total: 0,
      items: []
    }));
    // Create individual units from items with quantities > 1
    const individualItems: BinPackingItem[] = [];
    items.forEach(item => {
      const unitPrice = item.price;
      for (let i = 0; i < item.quantity; i++) {
        individualItems.push({
          id: `${item.id}-${i}`,
          value: unitPrice,
          item: {
            ...item,
            id: `${item.id}-${i}`,
            quantity: 1,
            total: unitPrice,
            originalQuantity: item.quantity,
            splitIndex: i + 1
          }
        });
      }
    });
    // Sort items by value descending
    let sortedItems = individualItems.sort((a, b) => b.value - a.value);
    // Greedy fill: for each group, fill to at least its target (or as close as possible), then move to next group
    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      while (group.total < group.targetAmount && sortedItems.length > 0) {
        // Find the largest item that fits without going over by more than 20%
        let idx = sortedItems.findIndex(item => group.total + item.value <= group.targetAmount * 1.2);
        if (idx === -1) idx = 0; // If nothing fits, take the largest remaining
        const binItem = sortedItems.splice(idx, 1)[0];
        group.items.push(binItem.item);
        group.total = Number((group.total + binItem.value).toFixed(2));
      }
    }
    // If any items remain, distribute to groups with the least overflow
    while (sortedItems.length > 0) {
      // Find group with least overflow (or least total if all under target)
      let minOverflow = Infinity;
      let minGroupIdx = 0;
      for (let g = 0; g < groups.length; g++) {
        const overflow = Math.max(0, groups[g].total - groups[g].targetAmount);
        if (overflow < minOverflow) {
          minOverflow = overflow;
          minGroupIdx = g;
        }
      }
      const binItem = sortedItems.shift()!;
      groups[minGroupIdx].items.push(binItem.item);
      groups[minGroupIdx].total = Number((groups[minGroupIdx].total + binItem.value).toFixed(2));
    }
    return groups;
  }
}
