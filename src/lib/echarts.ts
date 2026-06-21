import { BarChart, LineChart, RadarChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  RadarComponent,
  MarkLineComponent,
  MarkPointComponent,
} from "echarts/components";
import { init, use, type EChartsCoreOption } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

use([
  BarChart,
  LineChart,
  RadarChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  RadarComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer,
]);

export { init, type EChartsCoreOption as EChartsOption };
