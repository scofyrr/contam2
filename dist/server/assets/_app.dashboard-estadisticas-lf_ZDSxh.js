import { R as React, y as getDefaultExportFromCjs, U as reactExports, L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { u as useQuery } from "./useQuery-BWRVlDqX.js";
import { I as Input } from "./input-CVw-0GOD.js";
import { L as Label } from "./label-DrIl1YMr.js";
import { B as Badge } from "./badge-yaC6QAMb.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-B9UO78R2.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-DBf2jt_8.js";
import { c as clsx, a as cn } from "./utils-8RO4xBwZ.js";
import { i as filterProps, O as polarToCartesian, F as isFunction, D as Dot, d as Layer, A as Animate, y as interpolateNumber, z as isEqual, c as LabelList, G as Global, w as getValueByDataKey, K as last, I as isNil, m as generateCategoricalChart, k as formatAxisMap, g as Tooltip, R as ResponsiveContainer, X as XAxis, Y as YAxis, e as Legend, B as Bar, a as Cell } from "./generateCategoricalChart-Bx15tFyN.js";
import { C as Card, c as CardHeader, d as CardTitle, b as CardDescription, a as CardContent } from "./card-Cbh3F1c-.js";
import { a as CHART_THEME, C as CHART_CATALOG, g as exportToPdf, f as exportToExcel } from "./export-service-K0gYOsEZ.js";
import { B as BarChart } from "./BarChart-Ddr6dQRV.js";
import { C as CartesianGrid } from "./CartesianGrid-DXjk64D3.js";
import { A as AreaChart } from "./AreaChart-DjUf8R99.js";
import { A as Area } from "./Area-CNet8Ygk.js";
import { C as ComposedChart } from "./ComposedChart-BPRK3NoC.js";
import { L as Line } from "./Line-ClKEnyq8.js";
import { d as Polygon, b as PolarAngleAxis, c as PolarRadiusAxis, a as PieChart, P as Pie } from "./PieChart-BGRPAhXi.js";
import { L as LineChart } from "./LineChart-BBmmIqo0.js";
import { C as Checkbox } from "./checkbox-fWDk_Qti.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { E as ExportButtons } from "./export-buttons-Dvk19LPI.js";
import { m as computeKpis, l as computeCharts, n as computeKpisByRuc, E as getSireReadSource, t as fetchRegistrosSire, r as fetchLibroDiario } from "./router-B2fOVgbK.js";
import { C as ChartColumn } from "./chart-column-D891hKmx.js";
import { D as Database } from "./database-DaaekwpJ.js";
import { T as TrendingUp } from "./trending-up-H7BEnUdg.js";
import { T as TrendingDown } from "./trending-down-B-hiFKmE.js";
import { W as Wallet } from "./wallet-ipKTTbZm.js";
import { U as Users } from "./users-peXVpHFd.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CWutStw1.js";
import "./index-DkWXu2TP.js";
import "./Combination-D4Tn14OX.js";
import "./chevron-up-kSt2_UA7.js";
import "./index-Bkm5nwUb.js";
import "./dropdown-menu-DeulaLXn.js";
import "./index-CG6nsUgb.js";
import "./chevron-right-BUCAQpLv.js";
import "./circle-CDAFw6RI.js";
import "./loader-circle-DUOoJQci.js";
import "./upload-DWU6MdPY.js";
import "./file-spreadsheet-XtgtSkqf.js";
import "./file-text-C6WtH0h-.js";
import "./download-BejVGX4c.js";
var _excluded$1 = ["cx", "cy", "innerRadius", "outerRadius", "gridType", "radialLines"];
function _typeof$1(o) {
  "@babel/helpers - typeof";
  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$1(o);
}
function _objectWithoutProperties$1(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose$1(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose$1(source, excluded) {
  if (source == null) return {};
  var target = {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _extends$1() {
  _extends$1 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}
function ownKeys$1(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread$1(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys$1(Object(t), true).forEach(function(r2) {
      _defineProperty$1(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty$1(obj, key, value) {
  key = _toPropertyKey$1(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$1(t) {
  var i = _toPrimitive$1(t, "string");
  return "symbol" == _typeof$1(i) ? i : i + "";
}
function _toPrimitive$1(t, r) {
  if ("object" != _typeof$1(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != _typeof$1(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var getPolygonPath = function getPolygonPath2(radius, cx, cy, polarAngles) {
  var path = "";
  polarAngles.forEach(function(angle, i) {
    var point = polarToCartesian(cx, cy, radius, angle);
    if (i) {
      path += "L ".concat(point.x, ",").concat(point.y);
    } else {
      path += "M ".concat(point.x, ",").concat(point.y);
    }
  });
  path += "Z";
  return path;
};
var PolarAngles = function PolarAngles2(props) {
  var cx = props.cx, cy = props.cy, innerRadius = props.innerRadius, outerRadius = props.outerRadius, polarAngles = props.polarAngles, radialLines = props.radialLines;
  if (!polarAngles || !polarAngles.length || !radialLines) {
    return null;
  }
  var polarAnglesProps = _objectSpread$1({
    stroke: "#ccc"
  }, filterProps(props, false));
  return /* @__PURE__ */ React.createElement("g", {
    className: "recharts-polar-grid-angle"
  }, polarAngles.map(function(entry) {
    var start = polarToCartesian(cx, cy, innerRadius, entry);
    var end = polarToCartesian(cx, cy, outerRadius, entry);
    return /* @__PURE__ */ React.createElement("line", _extends$1({}, polarAnglesProps, {
      key: "line-".concat(entry),
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y
    }));
  }));
};
var ConcentricCircle = function ConcentricCircle2(props) {
  var cx = props.cx, cy = props.cy, radius = props.radius, index = props.index;
  var concentricCircleProps = _objectSpread$1(_objectSpread$1({
    stroke: "#ccc"
  }, filterProps(props, false)), {}, {
    fill: "none"
  });
  return /* @__PURE__ */ React.createElement("circle", _extends$1({}, concentricCircleProps, {
    className: clsx("recharts-polar-grid-concentric-circle", props.className),
    key: "circle-".concat(index),
    cx,
    cy,
    r: radius
  }));
};
var ConcentricPolygon = function ConcentricPolygon2(props) {
  var radius = props.radius, index = props.index;
  var concentricPolygonProps = _objectSpread$1(_objectSpread$1({
    stroke: "#ccc"
  }, filterProps(props, false)), {}, {
    fill: "none"
  });
  return /* @__PURE__ */ React.createElement("path", _extends$1({}, concentricPolygonProps, {
    className: clsx("recharts-polar-grid-concentric-polygon", props.className),
    key: "path-".concat(index),
    d: getPolygonPath(radius, props.cx, props.cy, props.polarAngles)
  }));
};
var ConcentricPath = function ConcentricPath2(props) {
  var polarRadius = props.polarRadius, gridType = props.gridType;
  if (!polarRadius || !polarRadius.length) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("g", {
    className: "recharts-polar-grid-concentric"
  }, polarRadius.map(function(entry, i) {
    var key = i;
    if (gridType === "circle") return /* @__PURE__ */ React.createElement(ConcentricCircle, _extends$1({
      key
    }, props, {
      radius: entry,
      index: i
    }));
    return /* @__PURE__ */ React.createElement(ConcentricPolygon, _extends$1({
      key
    }, props, {
      radius: entry,
      index: i
    }));
  }));
};
var PolarGrid = function PolarGrid2(_ref) {
  var _ref$cx = _ref.cx, cx = _ref$cx === void 0 ? 0 : _ref$cx, _ref$cy = _ref.cy, cy = _ref$cy === void 0 ? 0 : _ref$cy, _ref$innerRadius = _ref.innerRadius, innerRadius = _ref$innerRadius === void 0 ? 0 : _ref$innerRadius, _ref$outerRadius = _ref.outerRadius, outerRadius = _ref$outerRadius === void 0 ? 0 : _ref$outerRadius, _ref$gridType = _ref.gridType, gridType = _ref$gridType === void 0 ? "polygon" : _ref$gridType, _ref$radialLines = _ref.radialLines, radialLines = _ref$radialLines === void 0 ? true : _ref$radialLines, props = _objectWithoutProperties$1(_ref, _excluded$1);
  if (outerRadius <= 0) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("g", {
    className: "recharts-polar-grid"
  }, /* @__PURE__ */ React.createElement(PolarAngles, _extends$1({
    cx,
    cy,
    innerRadius,
    outerRadius,
    gridType,
    radialLines
  }, props)), /* @__PURE__ */ React.createElement(ConcentricPath, _extends$1({
    cx,
    cy,
    innerRadius,
    outerRadius,
    gridType,
    radialLines
  }, props)));
};
PolarGrid.displayName = "PolarGrid";
var head_1;
var hasRequiredHead;
function requireHead() {
  if (hasRequiredHead) return head_1;
  hasRequiredHead = 1;
  function head(array) {
    return array && array.length ? array[0] : void 0;
  }
  head_1 = head;
  return head_1;
}
var first$1;
var hasRequiredFirst;
function requireFirst() {
  if (hasRequiredFirst) return first$1;
  hasRequiredFirst = 1;
  first$1 = requireHead();
  return first$1;
}
var firstExports = requireFirst();
const first = /* @__PURE__ */ getDefaultExportFromCjs(firstExports);
var _excluded = ["key"];
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
    return !!t;
  })();
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf(o);
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf(o, p);
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Radar = /* @__PURE__ */ (function(_PureComponent) {
  function Radar2() {
    var _this;
    _classCallCheck(this, Radar2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Radar2, [].concat(args));
    _defineProperty(_this, "state", {
      isAnimationFinished: false
    });
    _defineProperty(_this, "handleAnimationEnd", function() {
      var onAnimationEnd = _this.props.onAnimationEnd;
      _this.setState({
        isAnimationFinished: true
      });
      if (isFunction(onAnimationEnd)) {
        onAnimationEnd();
      }
    });
    _defineProperty(_this, "handleAnimationStart", function() {
      var onAnimationStart = _this.props.onAnimationStart;
      _this.setState({
        isAnimationFinished: false
      });
      if (isFunction(onAnimationStart)) {
        onAnimationStart();
      }
    });
    _defineProperty(_this, "handleMouseEnter", function(e) {
      var onMouseEnter = _this.props.onMouseEnter;
      if (onMouseEnter) {
        onMouseEnter(_this.props, e);
      }
    });
    _defineProperty(_this, "handleMouseLeave", function(e) {
      var onMouseLeave = _this.props.onMouseLeave;
      if (onMouseLeave) {
        onMouseLeave(_this.props, e);
      }
    });
    return _this;
  }
  _inherits(Radar2, _PureComponent);
  return _createClass(Radar2, [{
    key: "renderDots",
    value: function renderDots(points) {
      var _this$props = this.props, dot = _this$props.dot, dataKey = _this$props.dataKey;
      var baseProps = filterProps(this.props, false);
      var customDotProps = filterProps(dot, true);
      var dots = points.map(function(entry, i) {
        var dotProps = _objectSpread(_objectSpread(_objectSpread({
          key: "dot-".concat(i),
          r: 3
        }, baseProps), customDotProps), {}, {
          dataKey,
          cx: entry.x,
          cy: entry.y,
          index: i,
          payload: entry
        });
        return Radar2.renderDotItem(dot, dotProps);
      });
      return /* @__PURE__ */ React.createElement(Layer, {
        className: "recharts-radar-dots"
      }, dots);
    }
  }, {
    key: "renderPolygonStatically",
    value: function renderPolygonStatically(points) {
      var _this$props2 = this.props, shape = _this$props2.shape, dot = _this$props2.dot, isRange = _this$props2.isRange, baseLinePoints = _this$props2.baseLinePoints, connectNulls = _this$props2.connectNulls;
      var radar;
      if (/* @__PURE__ */ React.isValidElement(shape)) {
        radar = /* @__PURE__ */ React.cloneElement(shape, _objectSpread(_objectSpread({}, this.props), {}, {
          points
        }));
      } else if (isFunction(shape)) {
        radar = shape(_objectSpread(_objectSpread({}, this.props), {}, {
          points
        }));
      } else {
        radar = /* @__PURE__ */ React.createElement(Polygon, _extends({}, filterProps(this.props, true), {
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
          points,
          baseLinePoints: isRange ? baseLinePoints : null,
          connectNulls
        }));
      }
      return /* @__PURE__ */ React.createElement(Layer, {
        className: "recharts-radar-polygon"
      }, radar, dot ? this.renderDots(points) : null);
    }
  }, {
    key: "renderPolygonWithAnimation",
    value: function renderPolygonWithAnimation() {
      var _this2 = this;
      var _this$props3 = this.props, points = _this$props3.points, isAnimationActive = _this$props3.isAnimationActive, animationBegin = _this$props3.animationBegin, animationDuration = _this$props3.animationDuration, animationEasing = _this$props3.animationEasing, animationId = _this$props3.animationId;
      var prevPoints = this.state.prevPoints;
      return /* @__PURE__ */ React.createElement(Animate, {
        begin: animationBegin,
        duration: animationDuration,
        isActive: isAnimationActive,
        easing: animationEasing,
        from: {
          t: 0
        },
        to: {
          t: 1
        },
        key: "radar-".concat(animationId),
        onAnimationEnd: this.handleAnimationEnd,
        onAnimationStart: this.handleAnimationStart
      }, function(_ref) {
        var t = _ref.t;
        var prevPointsDiffFactor = prevPoints && prevPoints.length / points.length;
        var stepData = points.map(function(entry, index) {
          var prev = prevPoints && prevPoints[Math.floor(index * prevPointsDiffFactor)];
          if (prev) {
            var _interpolatorX = interpolateNumber(prev.x, entry.x);
            var _interpolatorY = interpolateNumber(prev.y, entry.y);
            return _objectSpread(_objectSpread({}, entry), {}, {
              x: _interpolatorX(t),
              y: _interpolatorY(t)
            });
          }
          var interpolatorX = interpolateNumber(entry.cx, entry.x);
          var interpolatorY = interpolateNumber(entry.cy, entry.y);
          return _objectSpread(_objectSpread({}, entry), {}, {
            x: interpolatorX(t),
            y: interpolatorY(t)
          });
        });
        return _this2.renderPolygonStatically(stepData);
      });
    }
  }, {
    key: "renderPolygon",
    value: function renderPolygon() {
      var _this$props4 = this.props, points = _this$props4.points, isAnimationActive = _this$props4.isAnimationActive, isRange = _this$props4.isRange;
      var prevPoints = this.state.prevPoints;
      if (isAnimationActive && points && points.length && !isRange && (!prevPoints || !isEqual(prevPoints, points))) {
        return this.renderPolygonWithAnimation();
      }
      return this.renderPolygonStatically(points);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props5 = this.props, hide = _this$props5.hide, className = _this$props5.className, points = _this$props5.points, isAnimationActive = _this$props5.isAnimationActive;
      if (hide || !points || !points.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var layerClass = clsx("recharts-radar", className);
      return /* @__PURE__ */ React.createElement(Layer, {
        className: layerClass
      }, this.renderPolygon(), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, points));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curPoints: nextProps.points,
          prevPoints: prevState.curPoints
        };
      }
      if (nextProps.points !== prevState.curPoints) {
        return {
          curPoints: nextProps.points
        };
      }
      return null;
    }
  }, {
    key: "renderDotItem",
    value: function renderDotItem(option, props) {
      var dotItem;
      if (/* @__PURE__ */ React.isValidElement(option)) {
        dotItem = /* @__PURE__ */ React.cloneElement(option, props);
      } else if (isFunction(option)) {
        dotItem = option(props);
      } else {
        var key = props.key, dotProps = _objectWithoutProperties(props, _excluded);
        dotItem = /* @__PURE__ */ React.createElement(Dot, _extends({}, dotProps, {
          key,
          className: clsx("recharts-radar-dot", typeof option !== "boolean" ? option.className : "")
        }));
      }
      return dotItem;
    }
  }]);
})(reactExports.PureComponent);
_defineProperty(Radar, "displayName", "Radar");
_defineProperty(Radar, "defaultProps", {
  angleAxisId: 0,
  radiusAxisId: 0,
  hide: false,
  activeDot: true,
  dot: false,
  legendType: "rect",
  isAnimationActive: !Global.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: "ease"
});
_defineProperty(Radar, "getComposedData", function(_ref2) {
  var radiusAxis = _ref2.radiusAxis, angleAxis = _ref2.angleAxis, displayedData = _ref2.displayedData, dataKey = _ref2.dataKey, bandSize = _ref2.bandSize;
  var cx = angleAxis.cx, cy = angleAxis.cy;
  var isRange = false;
  var points = [];
  var angleBandSize = angleAxis.type !== "number" ? bandSize !== null && bandSize !== void 0 ? bandSize : 0 : 0;
  displayedData.forEach(function(entry, i) {
    var name = getValueByDataKey(entry, angleAxis.dataKey, i);
    var value = getValueByDataKey(entry, dataKey);
    var angle = angleAxis.scale(name) + angleBandSize;
    var pointValue = Array.isArray(value) ? last(value) : value;
    var radius = isNil(pointValue) ? void 0 : radiusAxis.scale(pointValue);
    if (Array.isArray(value) && value.length >= 2) {
      isRange = true;
    }
    points.push(_objectSpread(_objectSpread({}, polarToCartesian(cx, cy, radius, angle)), {}, {
      name,
      value,
      cx,
      cy,
      radius,
      angle,
      payload: entry
    }));
  });
  var baseLinePoints = [];
  if (isRange) {
    points.forEach(function(point) {
      if (Array.isArray(point.value)) {
        var baseValue = first(point.value);
        var radius = isNil(baseValue) ? void 0 : radiusAxis.scale(baseValue);
        baseLinePoints.push(_objectSpread(_objectSpread({}, point), {}, {
          radius
        }, polarToCartesian(cx, cy, radius, point.angle)));
      } else {
        baseLinePoints.push(point);
      }
    });
  }
  return {
    points,
    isRange,
    baseLinePoints
  };
});
var RadarChart = generateCategoricalChart({
  chartName: "RadarChart",
  GraphicalChild: Radar,
  axisComponents: [{
    axisType: "angleAxis",
    AxisComp: PolarAngleAxis
  }, {
    axisType: "radiusAxis",
    AxisComp: PolarRadiusAxis
  }],
  formatAxisMap,
  defaultProps: {
    layout: "centric",
    startAngle: 90,
    endAngle: -270,
    cx: "50%",
    cy: "50%",
    innerRadius: 0,
    outerRadius: "80%"
  }
});
const THEMES = { light: "", dark: ".dark" };
const ChartContext = reactExports.createContext(null);
function useChart() {
  const context = reactExports.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
const ChartContainer = reactExports.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = reactExports.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-chart": chartId,
      ref,
      className: cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children })
      ]
    }
  ) });
});
ChartContainer.displayName = "Chart";
const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(([, config2]) => config2.theme || config2.color);
  if (!colorConfig.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] || itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).join("\n")}
}
`
        ).join("\n")
      }
    }
  );
};
const ChartTooltip = Tooltip;
const ChartTooltipContent = reactExports.forwardRef(
  ({
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey
  }, ref) => {
    const { config } = useChart();
    const tooltipLabel = reactExports.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }
      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value = !labelKey && typeof label === "string" ? config[label]?.label || label : itemConfig?.label;
      if (labelFormatter) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("font-medium", labelClassName), children: labelFormatter(value, payload) });
      }
      if (!value) {
        return null;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("font-medium", labelClassName), children: value });
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
    if (!active || !payload?.length) {
      return null;
    }
    const nestLabel = payload.length === 1 && indicator !== "dot";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref,
        className: cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        ),
        children: [
          !nestLabel ? tooltipLabel : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5", children: payload.filter((item) => item.type !== "none").map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                ),
                children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  itemConfig?.icon ? /* @__PURE__ */ jsxRuntimeExports.jsx(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn(
                        "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                        {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed"
                        }
                      ),
                      style: {
                        "--color-bg": indicatorColor,
                        "--color-border": indicatorColor
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
                          nestLabel ? tooltipLabel : null,
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: itemConfig?.label || item.name })
                        ] }),
                        item.value && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium tabular-nums text-foreground", children: item.value.toLocaleString() })
                      ]
                    }
                  )
                ] })
              },
              item.dataKey
            );
          }) })
        ]
      }
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltip";
const ChartLegendContent = reactExports.forwardRef(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();
  if (!payload?.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      ),
      children: payload.filter((item) => item.type !== "none").map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            ),
            children: [
              itemConfig?.icon && !hideIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(itemConfig.icon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-2 w-2 shrink-0 rounded-[2px]",
                  style: {
                    backgroundColor: item.color
                  }
                }
              ),
              itemConfig?.label
            ]
          },
          item.value
        );
      })
    }
  );
});
ChartLegendContent.displayName = "ChartLegend";
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return void 0;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}
function ChartPanel({
  id,
  title,
  description,
  children,
  className,
  height = "h-[320px]"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      id,
      "data-export-chart": id,
      className: cn("overflow-hidden shadow-premium-subtle border-border/60", className),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 bg-muted/20 border-b border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", "data-chart-title": true, children: title }),
          description && /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs", children: description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: cn("pt-4", height), children })
      ]
    }
  );
}
function ChartEmpty({ message }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center text-sm text-muted-foreground", children: message });
}
function formatAxisMoney(value) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}k`;
  return value.toFixed(0);
}
const moneyTooltipFormatter = (value) => `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
function resolvePeriodoActual(filtroPeriodo, periodos) {
  if (filtroPeriodo) return filtroPeriodo;
  const sorted = [...new Set(periodos)].sort();
  return sorted.at(-1) ?? "";
}
function periodoBarColor(periodo, periodoActual) {
  if (!periodoActual) return CHART_THEME.periodRef;
  return periodo === periodoActual ? CHART_THEME.periodCurrent : CHART_THEME.periodRef;
}
function utilidadColor(value) {
  if (value > 0) return CHART_THEME.gain;
  if (value < 0) return CHART_THEME.loss;
  return CHART_THEME.neutral;
}
function formatPeriodoLabel(p) {
  if (p.length !== 6) return p;
  return `${p.slice(0, 4)}-${p.slice(4, 6)}`;
}
const chartConfig = {
  ventas: { label: "Ventas", color: CHART_THEME.ventas },
  compras: { label: "Compras", color: CHART_THEME.compras },
  utilidad: { label: "Utilidad", color: CHART_THEME.gain },
  igvVentas: { label: "IGV Ventas", color: CHART_THEME.igvVentas },
  igvCompras: { label: "IGV Compras", color: CHART_THEME.igvCompras }
};
function PeriodTick({
  x,
  y,
  payload,
  periodoActual
}) {
  if (x == null || y == null || !payload) return null;
  const current = payload.value === periodoActual;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "text",
    {
      x,
      y: y + 14,
      textAnchor: "middle",
      fill: current ? CHART_THEME.periodCurrent : CHART_THEME.neutral,
      fontSize: current ? 12 : 11,
      fontWeight: current ? 700 : 500,
      children: [
        formatPeriodoLabel(payload.value),
        current ? " ★" : ""
      ]
    }
  );
}
function DashboardCharts({ charts, loading, filtroPeriodo = "" }) {
  const periodos = charts.ventasPorPeriodo.map((p) => p.periodo);
  const periodoActual = resolvePeriodoActual(filtroPeriodo, periodos);
  const barData = charts.ventasPorPeriodo.map((v, i) => ({
    periodo: v.periodo,
    ventas: v.total,
    compras: charts.comprasPorPeriodo[i]?.total ?? 0,
    utilidad: charts.utilidadPorPeriodo[i]?.utilidad ?? 0
  }));
  const igvData = charts.igvPorPeriodo.map((p) => ({
    periodo: p.periodo,
    igvVentas: p.igvVentas,
    igvCompras: p.igvCompras,
    saldo: p.igvVentas - p.igvCompras
  }));
  const radarData = periodos.map((p) => ({
    periodo: formatPeriodoLabel(p),
    Ventas: charts.ventasPorPeriodo.find((v) => v.periodo === p)?.total ?? 0,
    Compras: charts.comprasPorPeriodo.find((v) => v.periodo === p)?.total ?? 0
  }));
  const tickProps = { periodoActual };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid lg:grid-cols-2 gap-6", children: [1, 2, 3, 4].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPanel, { id: `loading-${n}`, title: "Cargando…", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Obteniendo datos de registros SIRE…" }) }, n)) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "dashboard-charts-root", children: [
    periodoActual && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Periodo destacado:",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-blue-700", children: formatPeriodoLabel(periodoActual) }),
      " ",
      "(azul intenso en ejes) · Ganancias",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-600 font-medium", children: "verde" }),
      " · Pérdidas",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-medium", children: "rojo" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChartPanel,
        {
          id: "chart-ventas-compras",
          title: "Base imponible: ventas vs compras",
          description: "Verde = ventas · Rojo = compras · Eje: periodo actual resaltado",
          children: barData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin registros en el periodo seleccionado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: chartConfig, className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: barData, margin: { top: 8, right: 8, left: 0, bottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: CHART_THEME.grid }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "periodo", tick: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodTick, { ...p, ...tickProps }), height: 36 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: formatAxisMoney, tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { formatter: (v) => moneyTooltipFormatter(Number(v)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "ventas", name: "Ventas", radius: [4, 4, 0, 0], children: barData.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Cell,
              {
                fill: e.periodo === periodoActual ? "#15803d" : CHART_THEME.gain
              },
              `v-${e.periodo}`
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "compras", name: "Compras", radius: [4, 4, 0, 0], children: barData.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Cell,
              {
                fill: e.periodo === periodoActual ? "#b91c1c" : CHART_THEME.loss
              },
              `c-${e.periodo}`
            )) })
          ] }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChartPanel,
        {
          id: "chart-utilidad-bars",
          title: "Utilidad neta por periodo (barras)",
          description: "Verde si hay ganancia, rojo si hay pérdida",
          children: charts.utilidadPorPeriodo.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin datos de utilidad." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: chartConfig, className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: charts.utilidadPorPeriodo, margin: { top: 8, right: 8, left: 0, bottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "periodo", tick: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodTick, { ...p, ...tickProps }), height: 36 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: formatAxisMoney }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { formatter: (v) => moneyTooltipFormatter(Number(v)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "utilidad", name: "Utilidad", radius: [6, 6, 0, 0], children: charts.utilidadPorPeriodo.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: utilidadColor(e.utilidad) }, e.periodo)) })
          ] }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChartPanel,
        {
          id: "chart-utilidad",
          title: "Tendencia de utilidad",
          description: "Área según resultado del periodo",
          children: charts.utilidadPorPeriodo.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin datos." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: chartConfig, className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: charts.utilidadPorPeriodo, margin: { top: 8, right: 8, left: 0, bottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "periodo", tick: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodTick, { ...p, ...tickProps }), height: 36 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: formatAxisMoney }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { formatter: (v) => moneyTooltipFormatter(Number(v)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Area,
              {
                type: "monotone",
                dataKey: "utilidad",
                stroke: CHART_THEME.neutral,
                fill: CHART_THEME.periodRef,
                fillOpacity: 0.35,
                strokeWidth: 2,
                name: "Utilidad"
              }
            )
          ] }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPanel, { id: "chart-igv", title: "IGV y saldo fiscal", description: "Barras azules + línea de saldo", children: igvData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin datos de IGV." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: chartConfig, className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: igvData, margin: { top: 8, right: 8, left: 0, bottom: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "periodo", tick: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodTick, { ...p, ...tickProps }), height: 36 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: formatAxisMoney }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { formatter: (v) => moneyTooltipFormatter(Number(v)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "igvVentas", name: "IGV Ventas", radius: 3, children: igvData.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: periodoBarColor(e.periodo, periodoActual) }, `iv-${e.periodo}`)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "igvCompras", name: "IGV Compras", radius: 3, children: igvData.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Cell,
          {
            fill: e.periodo === periodoActual ? CHART_THEME.periodCurrent : CHART_THEME.periodRef,
            fillOpacity: 0.65
          },
          `ic-${e.periodo}`
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: "saldo",
            stroke: CHART_THEME.neutral,
            strokeWidth: 2,
            dot: (props) => {
              const { cx, cy, payload } = props;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "circle",
                {
                  cx,
                  cy,
                  r: 5,
                  fill: utilidadColor(payload.saldo),
                  stroke: "#fff",
                  strokeWidth: 1
                }
              );
            },
            name: "Saldo IGV"
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPanel, { id: "chart-mix", title: "Participación ventas / compras", description: "Distribución del volumen", children: charts.mixVentasCompras.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin datos." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Pie,
          {
            data: charts.mixVentasCompras,
            dataKey: "value",
            nameKey: "name",
            innerRadius: 55,
            outerRadius: 95,
            paddingAngle: 4,
            label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_THEME.gain }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_THEME.loss })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => moneyTooltipFormatter(v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPanel, { id: "chart-radar", title: "Radar comparativo por periodo", description: "Ventas y compras en todos los periodos", children: periodos.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Se necesitan al menos 2 periodos." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(RadarChart, { data: radarData, cx: "50%", cy: "50%", outerRadius: "75%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PolarGrid, { stroke: CHART_THEME.grid }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PolarAngleAxis, { dataKey: "periodo", tick: { fontSize: 10 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Radar,
          {
            name: "Ventas",
            dataKey: "Ventas",
            stroke: CHART_THEME.gain,
            fill: CHART_THEME.gain,
            fillOpacity: 0.35
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Radar,
          {
            name: "Compras",
            dataKey: "Compras",
            stroke: CHART_THEME.loss,
            fill: CHART_THEME.loss,
            fillOpacity: 0.25
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => moneyTooltipFormatter(v) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPanel, { id: "chart-importe", title: "Importe total de comprobantes", description: "Evolución por periodo", children: charts.importeTotalPorPeriodo.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin importes." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: chartConfig, className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: charts.importeTotalPorPeriodo, margin: { top: 8, right: 8, left: 0, bottom: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "periodo", tick: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodTick, { ...p, ...tickProps }), height: 36 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: formatAxisMoney }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { formatter: (v) => moneyTooltipFormatter(Number(v)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "ventas", stroke: CHART_THEME.gain, strokeWidth: 2, name: "Ventas", dot: { r: 3 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "compras", stroke: CHART_THEME.loss, strokeWidth: 2, name: "Compras", dot: { r: 3 } })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPanel, { id: "chart-composicion", title: "Composición mensual", description: "Base ventas y compras", children: charts.composicionMensual.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin datos." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: chartConfig, className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: charts.composicionMensual, margin: { top: 8, right: 8, left: 0, bottom: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "periodo", tick: (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodTick, { ...p, ...tickProps }), height: 36 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: formatAxisMoney }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { formatter: (v) => moneyTooltipFormatter(Number(v)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "baseVentas", stackId: "1", fill: CHART_THEME.gain, stroke: CHART_THEME.gain, fillOpacity: 0.5, name: "Base ventas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "baseCompras", stackId: "2", fill: CHART_THEME.loss, stroke: CHART_THEME.loss, fillOpacity: 0.4, name: "Base compras" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPanel, { id: "chart-tipo-cdp", title: "Por tipo de comprobante", description: "SUNAT cod_tipo_cdp", children: charts.porTipoComprobante.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin tipos." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: chartConfig, className: "h-full w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: charts.porTipoComprobante, layout: "vertical", margin: { top: 8, right: 16, left: 8, bottom: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tickFormatter: formatAxisMoney }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "codigo", width: 36 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { formatter: (v) => moneyTooltipFormatter(Number(v)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "ventas", fill: CHART_THEME.gain, name: "Ventas", radius: 3 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "compras", fill: CHART_THEME.loss, name: "Compras", radius: 3 })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPanel, { id: "chart-estado", title: "Estado de validación SIRE", description: "Pendiente / validado / IA", children: charts.porEstadoValidacion.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin estados." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: charts.porEstadoValidacion, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "estado", tick: { fontSize: 10 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "cantidad", name: "Registros", radius: [6, 6, 0, 0], children: charts.porEstadoValidacion.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Cell,
          {
            fill: row.estado === "validado" ? CHART_THEME.gain : row.estado === "pendiente" ? CHART_THEME.neutral : "#f59e0b"
          },
          row.estado
        )) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ChartPanel,
      {
        id: "chart-top-contrapartes",
        title: "Top contrapartes por importe",
        description: "Verde clientes · Rojo proveedores",
        children: charts.topContrapartes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartEmpty, { message: "Sin contrapartes." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: chartConfig, className: "h-full w-full max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: charts.topContrapartes, layout: "vertical", margin: { top: 8, right: 24, left: 8, bottom: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tickFormatter: formatAxisMoney }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "nombre", width: 140, tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { formatter: (v) => moneyTooltipFormatter(Number(v)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "importe", name: "Importe", radius: 4, children: charts.topContrapartes.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Cell,
            {
              fill: row.tipo === "VENTA" ? CHART_THEME.gain : CHART_THEME.loss
            },
            row.nombre
          )) })
        ] }) })
      }
    )
  ] });
}
const ALL_IDS = CHART_CATALOG.map((c) => c.id);
function ChartExportPanel({ pack, disabled }) {
  const [selected, setSelected] = reactExports.useState([...ALL_IDS]);
  const [includeRegistros, setIncludeRegistros] = reactExports.useState(true);
  const [includeLibro, setIncludeLibro] = reactExports.useState(true);
  const [includeKpis, setIncludeKpis] = reactExports.useState(true);
  const toggle = (id) => {
    setSelected(
      (prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const opts = {
    chartIds: selected,
    includeRegistros,
    includeLibro,
    includeKpis
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mb-6 border-primary/20 bg-gradient-to-br from-muted/40 to-background shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Exportar reportes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Elija tablas y gráficos a incluir en Excel o PDF" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: includeKpis, onCheckedChange: (v) => setIncludeKpis(!!v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "KPIs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: includeRegistros,
              onCheckedChange: (v) => setIncludeRegistros(!!v)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tabla Registros SIRE" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: includeLibro, onCheckedChange: (v) => setIncludeLibro(!!v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tabla Libro Diario" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-2", children: CHART_CATALOG.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "label",
        {
          className: "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs cursor-pointer hover:bg-muted/50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: selected.includes(c.id),
                onCheckedChange: () => toggle(c.id)
              }
            ),
            c.label
          ]
        },
        c.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            onClick: () => setSelected([...ALL_IDS]),
            children: "Todos los gráficos"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => setSelected([]), children: "Ninguno" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ExportButtons,
          {
            prominent: true,
            disabled: disabled || selected.length === 0 && !includeRegistros && !includeKpis,
            onExportExcel: () => exportToExcel(pack, opts),
            onExportPdf: () => exportToPdf(pack, opts)
          }
        )
      ] })
    ] })
  ] });
}
function formatPeriodoInput(value) {
  return value.replace(/\D/g, "").slice(0, 6);
}
function formatMoney(n) {
  return n.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "neutral"
}) {
  const iconWrap = tone === "gain" ? "bg-gain-subtle text-gain" : tone === "loss" ? "bg-loss-subtle text-loss" : "bg-neutral-subtle text-premium-cyan";
  const trendBadge = tone === "gain" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", className: "gap-0.5 rounded-full border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3" }),
    "Ingresos"
  ] }) : tone === "loss" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "gap-0.5 rounded-full border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "size-3" }),
    "Egresos"
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "gap-0.5 rounded-full", children: "Neutro" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "surface-panel p-6 hover-lift fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold tabular-nums tracking-tight text-foreground count-up", children: value }),
        trendBadge
      ] }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/80", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("rounded-xl p-3 shrink-0", iconWrap), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5", strokeWidth: 1.5 }) })
  ] }) });
}
function RegistrosPreviewTable({
  rows
}) {
  const preview = rows.slice(0, 12);
  if (preview.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-panel overflow-hidden mb-6 slide-right", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 border-b border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-foreground", children: "Vista registros SIRE" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
        "Misma fuente que el módulo Registros SIRE — ",
        rows.length,
        " filas"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent border-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Periodo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Contraparte" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Base" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "IGV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Estado" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: preview.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-border/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.periodo }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.tipo === "VENTA" ? "success" : "destructive", className: "rounded-full border-0", children: r.tipo }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[180px] truncate", children: r.nombre_contraparte }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: cn("text-right tabular-nums font-medium", r.tipo === "VENTA" ? "text-gain" : "text-loss"), children: formatMoney(Number(r.bi_grav ?? 0)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-premium-cyan", children: formatMoney(Number(r.igv_grav ?? 0)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold text-foreground", children: formatMoney(Number(r.importe_total)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.estado_validacion === "validado" ? "success" : r.estado_validacion === "pendiente" ? "warning" : "secondary", className: "rounded-full border-0 capitalize", children: r.estado_validacion ?? "pendiente" }) })
      ] }, r.id)) })
    ] }) })
  ] });
}
function DashboardEstadisticasPage() {
  const [periodoDesde, setPeriodoDesde] = reactExports.useState("");
  const [periodoHasta, setPeriodoHasta] = reactExports.useState("");
  const [rucFiltro, setRucFiltro] = reactExports.useState("");
  const [modo, setModo] = reactExports.useState("total");
  const filters = reactExports.useMemo(() => ({
    periodoDesde: periodoDesde || void 0,
    periodoHasta: periodoHasta || void 0,
    ruc: rucFiltro.trim() || void 0
  }), [periodoDesde, periodoHasta, rucFiltro]);
  const registrosQuery = useQuery({
    queryKey: ["dashboard_registros_sire", filters],
    queryFn: () => fetchRegistrosSire(filters)
  });
  const libroQuery = useQuery({
    queryKey: ["dashboard_libro_diario", filters],
    queryFn: () => fetchLibroDiario(filters)
  });
  const registros = registrosQuery.data ?? [];
  const libro = libroQuery.data ?? [];
  const periodoLabel = periodoDesde && periodoHasta ? `${periodoDesde}–${periodoHasta}` : periodoDesde || periodoHasta || null;
  const kpis = reactExports.useMemo(() => computeKpis(registros, periodoLabel), [registros, periodoLabel]);
  const charts = reactExports.useMemo(() => computeCharts(registros, periodoLabel), [registros, periodoLabel]);
  const kpisPorEntidad = reactExports.useMemo(() => modo === "individual" ? computeKpisByRuc(registros, periodoLabel) : [], [modo, registros, periodoLabel]);
  const loading = registrosQuery.isLoading || libroQuery.isLoading;
  const exportPack = reactExports.useMemo(() => ({
    titulo: "CONTAM_Dashboard",
    periodo: periodoLabel ?? void 0,
    registros,
    libro,
    kpis,
    charts
  }), [periodoLabel, registros, libro, kpis, charts]);
  const ratioTone = kpis.ratioIgv > 0 ? "gain" : kpis.ratioIgv < 0 ? "loss" : "neutral";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-6 fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-semibold text-foreground flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-premium-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "size-6", strokeWidth: 1.5 }) }),
          "Dashboard Estadístico"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "size-3.5 text-muted-foreground/70", strokeWidth: 1.5 }),
          "Conectado a",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs glass-surface px-2 py-0.5 rounded-md font-mono", children: getSireReadSource() }),
          libro.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            " ",
            "y",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs glass-surface px-2 py-0.5 rounded-md font-mono", children: "libro diario" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "success", className: "rounded-full border-0", children: [
            registros.length,
            " registros"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "rounded-full", children: [
            libro.length,
            " líneas diario"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-panel p-5 flex flex-wrap gap-4 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "Periodo desde (AAAAMM)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "202601", value: periodoDesde, onChange: (e) => setPeriodoDesde(formatPeriodoInput(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "Periodo hasta (AAAAMM)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "202612", value: periodoHasta, onChange: (e) => setPeriodoHasta(formatPeriodoInput(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-44 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "RUC contribuyente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Todos", value: rucFiltro, onChange: (e) => setRucFiltro(e.target.value.replace(/\D/g, "").slice(0, 11)), className: "font-mono" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-44 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: "Modo análisis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: modo, onValueChange: (v) => setModo(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "total", children: "Comparativo total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "individual", children: "Individual por entidad" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartExportPanel, { pack: exportPack, disabled: loading }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Ventas totales", value: `S/ ${formatMoney(kpis.ventasTotales)}`, subtitle: `${kpis.countVentas} comprobantes`, icon: TrendingUp, tone: "gain" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Compras totales", value: `S/ ${formatMoney(kpis.comprasTotales)}`, subtitle: `${kpis.countCompras} comprobantes`, icon: TrendingDown, tone: "loss" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Utilidad neta", value: `S/ ${formatMoney(kpis.utilidadNeta)}`, subtitle: "Base ventas − base compras", icon: Wallet, tone: kpis.utilidadNeta >= 0 ? "gain" : "loss" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { title: "Ratio IGV", value: `S/ ${formatMoney(kpis.ratioIgv)}`, subtitle: `V: ${formatMoney(kpis.igvVentas)} | C: ${formatMoney(kpis.igvCompras)}`, icon: ChartColumn, tone: ratioTone })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RegistrosPreviewTable, { rows: registros }),
    modo === "individual" && kpisPorEntidad.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-panel overflow-hidden slide-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-5 border-b border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-semibold text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 text-muted-foreground", strokeWidth: 1.5 }),
        "Reporte individual por entidad"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent border-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "RUC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Razón social" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ventas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Compras" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Utilidad" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ratio IGV" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: kpisPorEntidad.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-border/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: e.ruc }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate", children: e.razonSocial }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-gain font-medium", children: formatMoney(e.kpis.ventasTotales) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-loss font-medium", children: formatMoney(e.kpis.comprasTotales) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums font-semibold text-foreground", children: formatMoney(e.kpis.utilidadNeta) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-premium-cyan font-medium", children: formatMoney(e.kpis.ratioIgv) })
        ] }, e.ruc)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCharts, { charts, loading, filtroPeriodo: periodoLabel ?? "" })
  ] });
}
export {
  DashboardEstadisticasPage as component
};
