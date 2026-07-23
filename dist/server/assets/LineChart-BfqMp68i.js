import { m as generateCategoricalChart, X as XAxis, Y as YAxis, l as formatAxisMap } from "./generateCategoricalChart-BQLb8jz6.js";
import { L as Line } from "./Line-S-B0SzCb.js";
var LineChart = generateCategoricalChart({
  chartName: "LineChart",
  GraphicalChild: Line,
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
  LineChart as L
};
