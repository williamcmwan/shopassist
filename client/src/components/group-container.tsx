import { ShoppingGroup, ShoppingItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingItemComponent } from "./shopping-item";
import { cn } from "@/lib/utils";
import { PlusCircle, Edit2, Check, X } from "lucide-react";
import { useState } from "react";

interface GroupContainerProps {
  group: ShoppingGroup;
  onItemRemove: (itemId: string) => void;
  onDrop: (groupId: string, item: ShoppingItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, item: ShoppingItem) => void;
  onUpdateTarget: (groupId: string, newTarget: number) => void;
  editingGroupTarget: string | null;
  setEditingGroupTarget: (groupId: string | null) => void;
  isDragOver: boolean;
}

export function GroupContainer({
  group,
  onItemRemove,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  onUpdateTarget,
  editingGroupTarget,
  setEditingGroupTarget,
  isDragOver
}: GroupContainerProps) {
  const [editTargetValue, setEditTargetValue] = useState(group.targetAmount);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    const itemData = e.dataTransfer.getData("application/json");
    
    if (itemData) {
      try {
        const item: ShoppingItem = JSON.parse(itemData);
        onDrop(group.id, item);
      } catch (error) {
        console.error("Error parsing dropped item data:", error);
      }
    }
  };

  const handleSaveTarget = () => {
    if (editTargetValue > 0) {
      onUpdateTarget(group.id, editTargetValue);
    }
  };

  const handleCancelEdit = () => {
    setEditTargetValue(group.targetAmount);
    setEditingGroupTarget(null);
  };

  const excess = group.total - group.targetAmount;
  const isOverTarget = excess > 0;

  return (
    <div className="group-card bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Group {group.number}</h3>
        <div className="text-right">
          <p className="text-lg font-bold text-secondary">€{group.total.toFixed(2)}</p>
          {editingGroupTarget === group.id ? (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-600">Target:</span>
              <Input
                type="number"
                value={editTargetValue}
                onChange={(e) => setEditTargetValue(Number(e.target.value))}
                step="0.01"
                className="w-16 h-6 px-2 py-1 text-xs"
              />
              <Button
                size="sm"
                onClick={handleSaveTarget}
                className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-500">
                Target: €{group.targetAmount.toFixed(2)} 
                {isOverTarget ? (
                  <span className="text-orange-600"> (+€{excess.toFixed(2)})</span>
                ) : excess < 0 ? (
                  <span className="text-gray-600"> (€{excess.toFixed(2)})</span>
                ) : (
                  <span className="text-green-600"> (Perfect!)</span>
                )}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingGroupTarget(group.id);
                  setEditTargetValue(group.targetAmount);
                }}
                className="h-5 w-5 p-0 hover:bg-gray-100"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div
        className={cn(
          "min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg p-2 space-y-2 transition-colors",
          isDragOver && "bg-blue-50 border-primary"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(e);
        }}
        onDragLeave={onDragLeave}
      >
        {group.items.map((item) => (
          <div 
            key={item.id} 
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            className="bg-gray-50 border border-gray-200 rounded-lg p-2 cursor-move hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">{item.name} {item.originalQuantity && item.originalQuantity > 1 ? `(${item.quantity}/${item.originalQuantity})` : ''}</span>
              <span className="text-secondary font-medium">€{item.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
        
        {group.items.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            <PlusCircle className="h-6 w-6 mx-auto mb-1" />
            <p>Drop items here</p>
          </div>
        )}
      </div>
    </div>
  );
}
