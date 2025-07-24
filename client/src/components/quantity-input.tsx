import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantityInput({ 
  value, 
  onChange, 
  min = 1, 
  max = 999, 
  className = "" 
}: QuantityInputProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  };

  return (
    <div className={`flex items-center border border-gray-300 rounded-lg bg-white ${className}`}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-10 w-10 p-0 border-0 rounded-l-lg rounded-r-none hover:bg-gray-100 disabled:opacity-50 touch-manipulation"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="flex-1 text-center border-0 border-l border-r border-gray-300 rounded-none h-10 px-2 text-base font-medium focus:ring-0 focus:border-primary"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-10 w-10 p-0 border-0 rounded-r-lg rounded-l-none hover:bg-gray-100 disabled:opacity-50 touch-manipulation"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}