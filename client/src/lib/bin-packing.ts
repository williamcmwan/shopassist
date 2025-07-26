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
    // Expand group specs into individual groups
    const groups: ShoppingGroup[] = [];
    let groupId = 1;
    for (const spec of groupSpecs) {
      for (let i = 0; i < spec.count; i++) {
        groups.push({
          id: `group-${groupId++}`,
          number: groupId - 1,
          items: [],
          total: 0,
          targetAmount: spec.targetAmount
        });
      }
    }

    // Convert items to individual units
    const individualItems: { item: ShoppingItem; value: number }[] = [];
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const unitPrice = item.total / item.quantity;
        individualItems.push({
          item: {
            ...item,
            id: `${item.id}-${i + 1}`,
            quantity: 1,
            total: unitPrice,
            originalQuantity: item.quantity,
            splitIndex: i + 1
          },
          value: unitPrice
        });
      }
    }

    // Sort groups by target amount (descending) and items by value (descending)
    const sortedGroups = [...groups].sort((a, b) => b.targetAmount - a.targetAmount);
    const sortedItems = [...individualItems].sort((a, b) => b.value - a.value);

    // Phase 1: Greedy fill with target optimization
    const remainingItems = [...sortedItems];
    const filledGroups = sortedGroups.map(g => ({ ...g, items: [...g.items], total: g.total }));

    // Fill each group optimally
    for (let g = 0; g < filledGroups.length; g++) {
      const group = filledGroups[g];
      
      // Try to fill the group to exactly its target or as close as possible
      while (group.total < group.targetAmount && remainingItems.length > 0) {
        // Find the best item to add (closest to target without going over, or smallest overfill)
        let bestIdx = -1;
        let bestScore = -Infinity;
        
        for (let i = 0; i < remainingItems.length; i++) {
          const newTotal = group.total + remainingItems[i].value;
          const distanceToTarget = Math.abs(newTotal - group.targetAmount);
          const isOverTarget = newTotal > group.targetAmount;
          
          // Prefer items that get us closer to target, with slight preference for not going over
          const score = -distanceToTarget - (isOverTarget ? 0.1 : 0);
          
          if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }
        
        if (bestIdx === -1) break;
        
        const selectedItem = remainingItems.splice(bestIdx, 1)[0];
        group.items.push(selectedItem.item);
        group.total = Number((group.total + selectedItem.value).toFixed(2));
      }
    }

    // Phase 2: Redistribute remaining items optimally
    while (remainingItems.length > 0) {
      // Find the group that would benefit most from an additional item
      let bestGroupIdx = -1;
      let bestImprovement = -Infinity;
      
      for (let g = 0; g < filledGroups.length; g++) {
        const group = filledGroups[g];
        const currentDistance = Math.abs(group.total - group.targetAmount);
        
        // Try each remaining item
        for (let i = 0; i < remainingItems.length; i++) {
          const newTotal = group.total + remainingItems[i].value;
          const newDistance = Math.abs(newTotal - group.targetAmount);
          const improvement = currentDistance - newDistance;
          
          if (improvement > bestImprovement) {
            bestImprovement = improvement;
            bestGroupIdx = g;
          }
        }
      }
      
      if (bestGroupIdx === -1) break;
      
      // Add the best item to the best group
      const bestItem = remainingItems.shift()!;
      filledGroups[bestGroupIdx].items.push(bestItem.item);
      filledGroups[bestGroupIdx].total = Number((filledGroups[bestGroupIdx].total + bestItem.value).toFixed(2));
    }

    // Phase 3: Try to optimize by swapping items between groups
    const optimizedGroups = this.optimizeBySwapping(filledGroups);
    
    return optimizedGroups;
  }

  private static optimizeBySwapping(groups: ShoppingGroup[]): ShoppingGroup[] {
    let improved = true;
    let iterations = 0;
    const maxIterations = 50; // Prevent infinite loops
    
    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      
      // Try all possible swaps between groups
      for (let i = 0; i < groups.length; i++) {
        for (let j = i + 1; j < groups.length; j++) {
          const groupA = groups[i];
          const groupB = groups[j];
          
          // Calculate current distances to targets
          const currentDistanceA = Math.abs(groupA.total - groupA.targetAmount);
          const currentDistanceB = Math.abs(groupB.total - groupB.targetAmount);
          const currentTotalDistance = currentDistanceA + currentDistanceB;
          
          // Try swapping each item from group A with each item from group B
          for (let itemAIdx = 0; itemAIdx < groupA.items.length; itemAIdx++) {
            for (let itemBIdx = 0; itemBIdx < groupB.items.length; itemBIdx++) {
              const itemA = groupA.items[itemAIdx];
              const itemB = groupB.items[itemBIdx];
              
              // Calculate new totals after swap
              const newTotalA = groupA.total - itemA.total + itemB.total;
              const newTotalB = groupB.total - itemB.total + itemA.total;
              
              // Calculate new distances to targets
              const newDistanceA = Math.abs(newTotalA - groupA.targetAmount);
              const newDistanceB = Math.abs(newTotalB - groupB.targetAmount);
              const newTotalDistance = newDistanceA + newDistanceB;
              
              // If the swap improves the overall fit, perform it
              if (newTotalDistance < currentTotalDistance) {
                // Perform the swap
                groupA.items[itemAIdx] = itemB;
                groupB.items[itemBIdx] = itemA;
                groupA.total = Number(newTotalA.toFixed(2));
                groupB.total = Number(newTotalB.toFixed(2));
                
                improved = true;
                break; // Move to next group pair
              }
            }
            if (improved) break;
          }
        }
      }
    }
    
    return groups;
  }
}

// Helper: Try to rearrange items between groups to meet all targets (limited-depth DFS)
function tryRearrange(groups: ShoppingGroup[], allItems: ShoppingItem[], depth = 0, maxDepth = 1000, visited = new Set<string>()): ShoppingGroup[] | null {
  if (depth > maxDepth) return null;
  
  // Create a hash of the current state to avoid revisiting
  const stateHash = groups.map(g => `${g.total.toFixed(2)}:${g.items.map(i => i.id).sort().join(',')}`).join('|');
  if (visited.has(stateHash)) return null;
  visited.add(stateHash);
  
  // Check if all groups meet their targets
  if (groups.every(g => g.total >= g.targetAmount)) {
    return groups.map(g => ({ ...g, items: [...g.items] }));
  }
  
  // Try swapping items between groups that are under target
  const underTargetGroups = groups.map((g, i) => ({ group: g, index: i })).filter(({ group }) => group.total < group.targetAmount);
  const overTargetGroups = groups.map((g, i) => ({ group: g, index: i })).filter(({ group }) => group.total > group.targetAmount);
  
  // Try swaps between under-target and over-target groups
  for (const { group: underGroup, index: underIdx } of underTargetGroups) {
    for (const { group: overGroup, index: overIdx } of overTargetGroups) {
      for (let m = 0; m < underGroup.items.length; m++) {
        for (let n = 0; n < overGroup.items.length; n++) {
          // Create new groups with the swap
          const newGroups = groups.map(g => ({ ...g, items: [...g.items], total: g.total }));
          const itemA = newGroups[underIdx].items[m];
          const itemB = newGroups[overIdx].items[n];
          
          // Only swap if it helps
          const underNewTotal = newGroups[underIdx].total - itemA.total + itemB.total;
          const overNewTotal = newGroups[overIdx].total - itemB.total + itemA.total;
          
          if (underNewTotal >= newGroups[underIdx].targetAmount && overNewTotal >= newGroups[overIdx].targetAmount) {
            newGroups[underIdx].items[m] = itemB;
            newGroups[overIdx].items[n] = itemA;
            newGroups[underIdx].total = Number(underNewTotal.toFixed(2));
            newGroups[overIdx].total = Number(overNewTotal.toFixed(2));
            
            // Recurse
            const result = tryRearrange(newGroups, allItems, depth + 1, maxDepth, visited);
            if (result) return result;
          }
        }
      }
    }
  }
  
  return null;
}
