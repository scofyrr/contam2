import { m as generateCategoricalChart, X as XAxis, Y as YAxis, l as formatAxisMap } from "./generateCategoricalChart-CXYoKBQ-.js";
import { L as Line } from "./Line-yFhjZWFG.js";
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
