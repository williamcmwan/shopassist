import { ShoppingList, ShoppingItem } from "@shared/schema";

const STORAGE_KEY = "shopping_lists";

export class LocalStorageService {
  private static instance: LocalStorageService;

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  getAllLists(): ShoppingList[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  saveList(list: ShoppingList): void {
    try {
      const lists = this.getAllLists();
      const existingIndex = lists.findIndex(l => l.id === list.id);
      
      if (existingIndex >= 0) {
        lists[existingIndex] = list;
      } else {
        lists.push(list);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  getList(id: string): ShoppingList | null {
    const lists = this.getAllLists();
    return lists.find(l => l.id === id) || null;
  }

  deleteList(id: string): void {
    try {
      const lists = this.getAllLists();
      const filteredLists = lists.filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLists));
    } catch (error) {
      console.error("Error deleting from localStorage:", error);
    }
  }

  updateList(list: ShoppingList): void {
    this.saveList(list);
  }
}

export const storageService = LocalStorageService.getInstance();
