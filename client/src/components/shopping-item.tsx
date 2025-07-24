import { ShoppingItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShoppingItemProps {
  item: ShoppingItem;
  onRemove: (id: string) => void;
  isDragging?: boolean;
  isInGroup?: boolean;
}

export function ShoppingItemComponent({ 
  item, 
  onRemove, 
  isDragging = false,
  isInGroup = false 
}: ShoppingItemProps) {
  return (
    <div
      draggable
      data-item-id={item.id}
      className={cn(
        "bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm cursor-move hover:shadow-md transition-shadow",
        isDragging && "opacity-50 transform rotate-1",
        isInGroup && "bg-gray-50 border-gray-200"
      )}
    >
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
          <GripVertical className="h-4 w-4 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="text-destructive hover:bg-red-50 p-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
