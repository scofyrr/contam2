import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SectionHeader, SectionBody } from "@/components/contribuyentes/section-header";

type Props<T> = {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  emptyHint?: string;
};

export function DynamicArrayBlock<T>({
  title,
  items,
  onAdd,
  onRemove,
  renderItem,
  emptyHint = "Presione + para agregar un registro",
}: Props<T>) {
  return (
    <div className="mb-6">
      <SectionHeader title={title}>
        <Button type="button" size="sm" onClick={onAdd} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="size-4 mr-1" />
          Agregar
        </Button>
      </SectionHeader>
      <SectionBody>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyHint}</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative rounded-lg border bg-muted/20 p-4 pt-8"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
                <span className="absolute top-2 left-3 text-xs font-semibold text-blue-700">
                  #{index + 1}
                </span>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        )}
      </SectionBody>
    </div>
  );
}
