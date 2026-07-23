import { m as generateCategoricalChart, X as XAxis, Y as YAxis, l as formatAxisMap } from "./generateCategoricalChart-BQLb8jz6.js";
import { A as Area } from "./Area-Cz3hqHMc.js";
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
