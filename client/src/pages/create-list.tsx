import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingList } from "@shared/schema";
import { storageService } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function CreateListPage() {
  const [, setLocation] = useLocation();
  const [listName, setListName] = useState("");

  const getTodaysDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateList = () => {
    const name = listName.trim() || getTodaysDate();
    const newList: ShoppingList = {
      id: `list-${Date.now()}`,
      name,
      date: new Date().toISOString(),
      items: [],
      total: 0,
      isSplitMode: false,
    };

    storageService.saveList(newList);
    setLocation(`/list/${newList.id}`);
  };

  const handleCancel = () => {
    setLocation("/");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6 pt-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="mr-4 p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Create Shopping List</h1>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2">
              List Name
            </Label>
            <Input
              id="listName"
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Weekly Groceries"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use today's date</p>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateList}
              className="flex-1 px-4 py-3 bg-primary text-white hover:bg-blue-800 font-medium"
            >
              Create List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
