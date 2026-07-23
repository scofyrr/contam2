import { m as generateCategoricalChart, B as Bar, X as XAxis, Y as YAxis, l as formatAxisMap } from "./generateCategoricalChart-BQLb8jz6.js";
var BarChart = generateCategoricalChart({
  chartName: "BarChart",
  GraphicalChild: Bar,
  defaultTooltipEventType: "axis",
  validateTooltipEventTypes: ["axis", "item"],
  axisComponents: [{
    axisType: "xAxis",
    AxisComp: XAxis
  }, {
    axisType: "yAxis",
    AxisComp: YAxis
  }],
  formatAxisMap
});
export {
  BarChart as B
};
