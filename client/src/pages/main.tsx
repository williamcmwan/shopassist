import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingList } from "@shared/schema";
import { storageService } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Plus, Edit2, Trash2, ShoppingBag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MainPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);

  useEffect(() => {
    const savedLists = storageService.getAllLists();
    setLists(savedLists);
  }, []);

  const handleDeleteList = (listId: string) => {
    storageService.deleteList(listId);
    const updatedLists = storageService.getAllLists();
    setLists(updatedLists);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Lists</h1>
            <p className="text-sm text-gray-600">Manage your shopping efficiently</p>
          </div>
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <ShoppingCart className="text-white text-lg" />
          </div>
        </div>

        {/* Create New List Button */}
        <Link href="/create">
          <Button className="w-full bg-primary text-white rounded-lg p-4 mb-6 flex items-center justify-center space-x-2 shadow-lg hover:bg-blue-800 transition-colors">
            <Plus className="h-4 w-4" />
            <span className="font-medium">Create New Shopping List</span>
          </Button>
        </Link>

        {/* Previous Lists */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Lists</h2>
          
          {lists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="h-16 w-16 mx-auto mb-3 text-gray-300" />
              <p>No previous shopping lists</p>
              <p className="text-sm">Create your first list to get started</p>
            </div>
          ) : (
            lists.map((list) => (
              <Card key={list.id} className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{list.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">{new Date(list.date).toLocaleDateString()}</p>
                        <p className="text-sm font-medium text-secondary">€{list.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{list.items.length} items</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/list/${list.id}`}>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-blue-50 p-2"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-red-50 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Shopping List</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{list.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteList(list.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
