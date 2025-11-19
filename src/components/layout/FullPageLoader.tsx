"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';

const FullPageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default FullPageLoader;