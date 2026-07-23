import { m as generateCategoricalChart, X as XAxis, Y as YAxis, l as formatAxisMap } from "./generateCategoricalChart-CXYoKBQ-.js";
import { A as Area } from "./Area-C-uW_3G1.js";
var AreaChart = generateCategoricalChart({
  chartName: "AreaChart",
  GraphicalChild: Area,
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
  AreaChart as A
};
