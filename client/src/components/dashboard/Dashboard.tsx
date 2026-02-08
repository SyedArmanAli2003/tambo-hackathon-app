import React from "react";
import { Card } from "@/components/ui/card";
import KPICard from "./KPICard";
import LineChart from "./LineChart";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import DataTable from "./DataTable";
import ScatterPlot from "./ScatterPlot";
import StatCard from "./StatCard";
import TextBlock from "./TextBlock";

type WidgetType =
  | "KPICard"
  | "LineChart"
  | "BarChart"
  | "PieChart"
  | "DataTable"
  | "ScatterPlot"
  | "StatCard"
  | "TextBlock";

interface DashboardWidget {
  type: WidgetType;
  [key: string]: unknown;
}

interface DashboardProps {
  title?: string;
  widgets: DashboardWidget[];
}

const widgetMap: Record<WidgetType, React.ComponentType<any>> = {
  KPICard,
  LineChart,
  BarChart,
  PieChart,
  DataTable,
  ScatterPlot,
  StatCard,
  TextBlock,
};

/**
* Dashboard Component
* Renders a grid of dashboard widgets.
*/
export default function Dashboard({ title, widgets }: DashboardProps) {
  if (widgets.length === 0) {
    return (
      <Card className="p-6 border-2 border-slate-200">
        <p className="text-sm text-slate-700">No widgets were generated.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {title ? <h2 className="text-xl font-bold text-slate-900">{title}</h2> : null}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {widgets.map((widget, idx) => {
          const Widget = widgetMap[widget.type];
          if (!Widget) {
            return (
              <Card
                key={`${widget.type}-${idx}`}
                className="p-4 border-2 border-slate-200"
              >
                <p className="text-sm text-slate-700">
                  Unknown widget type: <span className="font-mono">{widget.type}</span>
                </p>
              </Card>
            );
          }

          const { type: _, ...props } = widget;
          return <Widget key={`${widget.type}-${idx}`} {...props} />;
        })}
      </div>
    </div>
  );
}
