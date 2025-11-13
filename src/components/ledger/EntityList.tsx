"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LedgerEntity, LedgerEntityType } from '@/types';
import { User, Package, Truck, Users, Search, PlusCircle, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EntityListProps {
  entities: LedgerEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
  onAddExternalEntity: () => void;
}

const getEntityIcon = (type: LedgerEntityType) => {
  switch (type) {
    case 'customer':
      return <User className="h-4 w-4 text-blue-500" />;
    case 'reseller':
      return <Users className="h-4 w-4 text-purple-500" />;
    case 'supplier':
      return <Truck className="h-4 w-4 text-green-500" />;
    case 'other':
      return <BookOpen className="h-4 w-4 text-gray-500" />;
    default:
      return <User className="h-4 w-4 text-gray-500" />;
  }
};

const EntityList: React.FC<EntityListProps> = ({ entities, selectedEntityId, onSelectEntity, onAddExternalEntity }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntities = useMemo(() => {
    return entities.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.contact.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [entities, searchTerm]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Ledger Entities</CardTitle>
        <div className="flex space-x-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search name or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Button size="icon" variant="outline" onClick={onAddExternalEntity} title="Add External Entity">
                <PlusCircle className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-1 p-4 pt-0">
            {filteredEntities.map(entity => (
              <div
                key={entity.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                  selectedEntityId === entity.id ? "bg-primary/10 border border-primary/50" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                onClick={() => onSelectEntity(entity.id)}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {getEntityIcon(entity.type)}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{entity.name}</p>
                    <p className="text-xs text-gray-500 truncate">{entity.contact}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize flex-shrink-0">
                  {entity.type}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EntityList;