import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function InvalidWidgetState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Card className="p-6 border-2 border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            {title}
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
            {message}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
            Try regenerating this widget.
          </p>
        </div>
      </div>
    </Card>
  );
}
