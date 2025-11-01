"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ id, label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center space-x-2">
        <Input 
          id={`${id}-color-picker`} 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-12 h-12 p-0 cursor-pointer"
        />
        <Input 
          id={id}
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="flex-1 font-mono"
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  );
};

export default ColorInput;