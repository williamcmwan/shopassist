import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ShoppingList, ShoppingItem, ShoppingGroup, InsertShoppingItem } from "@shared/schema";
import { storageService } from "@/lib/storage";
import { BinPackingAlgorithm } from "@/lib/bin-packing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingItemComponent } from "@/components/shopping-item";
import { GroupContainer } from "@/components/group-container";
import { ArrowLeft, Plus, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ShoppingListPage() {
  const [, params] = useRoute("/list/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [newItem, setNewItem] = useState<InsertShoppingItem>({
    name: "",
    price: 0,
    quantity: 1
  });
  const [targetAmount, setTargetAmount] = useState<number>(50);
  const [numberOfGroups, setNumberOfGroups] = useState<number>(2);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ price: number; quantity: number }>({ price: 0, quantity: 1 });

  useEffect(() => {
    if (params?.id) {
      const list = storageService.getList(params.id);
      if (list) {
        setCurrentList(list);
      } else {
        toast({
          title: "List not found",
          description: "The shopping list you're looking for doesn't exist.",
          variant: "destructive"
        });
        setLocation("/");
      }
    }
  }, [params?.id, setLocation, toast]);

  const updateList = (updatedList: ShoppingList) => {
    const totalAmount = updatedList.items.reduce((sum, item) => sum + item.total, 0);
    updatedList.total = Number(totalAmount.toFixed(2));
    
    setCurrentList(updatedList);
    storageService.updateList(updatedList);
  };

  const handleAddItem = () => {
    if (!currentList || !newItem.name.trim() || newItem.price <= 0) {
      toast({
        title: "Invalid item",
        description: "Please enter a valid item name and price.",
        variant: "destructive"
      });
      return;
    }

    const item: ShoppingItem = {
      id: `item-${Date.now()}`,
      name: newItem.name.trim(),
      price: Number(newItem.price),
      quantity: newItem.quantity,
      total: Number((newItem.price * newItem.quantity).toFixed(2))
    };

    const updatedList = {
      ...currentList,
      items: [...currentList.items, item]
    };

    updateList(updatedList);
    setNewItem({ name: "", price: 0, quantity: 1 });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!currentList) return;

    const updatedList = {
      ...currentList,
      items: currentList.items.filter(item => item.id !== itemId),
      groups: currentList.groups?.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== itemId),
        total: Number(group.items
          .filter(item => item.id !== itemId)
          .reduce((sum, item) => sum + item.total, 0)
          .toFixed(2))
      }))
    };

    updateList(updatedList);
  };

  const handleToggleSplitMode = () => {
    if (!currentList) return;

    const updatedList = {
      ...currentList,
      isSplitMode: !currentList.isSplitMode,
      groups: !currentList.isSplitMode ? [] : currentList.groups
    };

    updateList(updatedList);
  };

  const handleRunBinPacking = () => {
    if (!currentList || currentList.items.length === 0) {
      toast({
        title: "No items",
        description: "Add some items before splitting the list.",
        variant: "destructive"
      });
      return;
    }

    if (numberOfGroups < 2 || numberOfGroups > 5) {
      toast({
        title: "Invalid number of groups",
        description: "Number of groups must be between 2 and 5.",
        variant: "destructive"
      });
      return;
    }

    const groups = BinPackingAlgorithm.optimize(
      currentList.items,
      targetAmount,
      numberOfGroups
    );

    const updatedList = {
      ...currentList,
      groups,
      isSplitMode: true
    };

    updateList(updatedList);
    
    toast({
      title: "List split successfully",
      description: `Items have been distributed into ${numberOfGroups} groups.`
    });
  };

  const handleDragStart = (e: React.DragEvent, item: ShoppingItem) => {
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverGroup(null);
    }
  };

  const handleGroupDragOver = (groupId: string) => {
    setDragOverGroup(groupId);
  };

  const handleDropOnGroup = (groupId: string, droppedItem: ShoppingItem) => {
    if (!currentList || !currentList.groups) return;

    // Remove item from all groups first
    const updatedGroups = currentList.groups.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== droppedItem.id),
      total: Number(group.items
        .filter(item => item.id !== droppedItem.id)
        .reduce((sum, item) => sum + item.total, 0)
        .toFixed(2))
    }));

    // Add item to target group
    const targetGroupIndex = updatedGroups.findIndex(group => group.id === groupId);
    if (targetGroupIndex >= 0) {
      updatedGroups[targetGroupIndex].items.push(droppedItem);
      updatedGroups[targetGroupIndex].total = Number(
        (updatedGroups[targetGroupIndex].total + droppedItem.total).toFixed(2)
      );
    }

    const updatedList = {
      ...currentList,
      groups: updatedGroups
    };

    updateList(updatedList);
    setDragOverGroup(null);
  };

  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item.id);
    setEditForm({ price: item.price, quantity: item.quantity });
  };

  const handleSaveEdit = (itemId: string) => {
    if (!currentList) return;

    const updatedItems = currentList.items.map(item => {
      if (item.id === itemId) {
        const newTotal = Number((editForm.price * editForm.quantity).toFixed(2));
        return {
          ...item,
          price: editForm.price,
          quantity: editForm.quantity,
          total: newTotal
        };
      }
      return item;
    });

    // Also update item in groups if it exists
    const updatedGroups = currentList.groups?.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.id === itemId) {
          const newTotal = Number((editForm.price * editForm.quantity).toFixed(2));
          return {
            ...item,
            price: editForm.price,
            quantity: editForm.quantity,
            total: newTotal
          };
        }
        return item;
      }),
      total: Number(group.items.map(item => {
        if (item.id === itemId) {
          return Number((editForm.price * editForm.quantity).toFixed(2));
        }
        return item.total;
      }).reduce((sum, total) => sum + total, 0).toFixed(2))
    }));

    const updatedList = {
      ...currentList,
      items: updatedItems,
      groups: updatedGroups
    };

    updateList(updatedList);
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const scrollToAddForm = () => {
    document.querySelector('.add-item-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!currentList) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const unassignedItems = currentList.isSplitMode && currentList.groups 
    ? currentList.items.filter(item => 
        !currentList.groups?.some(group => group.items.some(groupItem => groupItem.id === item.id))
      )
    : currentList.items;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="mr-3 p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{currentList.name}</h1>
              <p className="text-sm text-gray-600">
                {new Date(currentList.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-secondary">€{currentList.total.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{currentList.items.length} items</p>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="add-item-form bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-12 gap-2">
          <Input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Item name"
            className="col-span-6 px-3 py-2 text-sm"
          />
          <Input
            type="number"
            value={newItem.price || ""}
            onChange={(e) => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
            placeholder="€0.00"
            step="0.01"
            className="col-span-3 px-3 py-2 text-sm"
          />
          <Input
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
            placeholder="Qty"
            min="1"
            className="col-span-2 px-3 py-2 text-sm"
          />
          <Button 
            onClick={handleAddItem}
            className="col-span-1 bg-primary text-white hover:bg-blue-800 flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Split Controls */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Split List</h3>
          <Button 
            variant="ghost"
            onClick={handleToggleSplitMode}
            className="text-primary hover:bg-blue-50 px-3 py-1 text-sm font-medium"
          >
            {currentList.isSplitMode ? 'Exit Split' : 'Split Items'}
          </Button>
        </div>
        
        {currentList.isSplitMode && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                placeholder="Target amount per group"
                step="0.01"
                className="flex-1 px-3 py-2 text-sm"
              />
              <Input
                type="number"
                value={numberOfGroups}
                onChange={(e) => setNumberOfGroups(Number(e.target.value))}
                placeholder="Groups"
                min="2"
                max="5"
                className="w-20 px-3 py-2 text-sm"
              />
              <Button 
                onClick={handleRunBinPacking}
                className="bg-accent text-white px-4 py-2 hover:bg-orange-600 text-sm font-medium"
              >
                Split
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Items List / Groups */}
      <div className="flex-1 overflow-y-auto">
        {currentList.isSplitMode ? (
          <div className="p-4 space-y-4">
            {currentList.groups?.map((group) => (
              <GroupContainer
                key={group.id}
                group={group}
                onItemRemove={handleRemoveItem}
                onDrop={handleDropOnGroup}
                onDragOver={() => handleGroupDragOver(group.id)}
                onDragLeave={handleDragLeave}
                isDragOver={dragOverGroup === group.id}
              />
            ))}
            
            {unassignedItems.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Unassigned Items</h3>
                <div className="space-y-2">
                  {unassignedItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="bg-white border border-yellow-300 rounded p-2 cursor-move hover:bg-yellow-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-secondary font-medium">€{item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {currentList.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No items in this list yet</p>
                <p className="text-sm">Add some items to get started</p>
              </div>
            ) : (
              currentList.items.map((item) => (
                editingItem === item.id ? (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="€0.00"
                          step="0.01"
                          className="flex-1 px-2 py-1 text-sm"
                        />
                        <Input
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) => setEditForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                          placeholder="Qty"
                          min="1"
                          className="w-16 px-2 py-1 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(item.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:bg-gray-100 px-2 py-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-gray-600">€{item.price.toFixed(2)}</span>
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-sm font-medium text-secondary">€{item.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="text-primary hover:bg-blue-50 p-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-destructive hover:bg-red-50 p-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {currentList.isSplitMode && (
        <Button
          onClick={scrollToAddForm}
          className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg hover:bg-orange-600 hover:scale-110 transition-all duration-200"
          style={{ zIndex: 20 }}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
