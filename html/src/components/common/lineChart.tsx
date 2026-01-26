// 折れ線グラフ
// ※各グラフの使用方法は下記の公式サイトを参照してください。
// https://recharts.org/en-US/

import React from "react";
import * as Atom from "../../stores/atomTrendModal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CurveType } from "recharts/types/shape/Curve";
import { Margin } from "recharts/types/util/types";

interface Props {
  lineData: Atom.LineDataType[];
  lineType: CurveType;
  lineLayoutList: Atom.LineLayoutData[];
  ContainerWidth?: string;
  ContainerHeight?: string;
  LineChartMargin?: Margin;
  LineChartWidth?: number;
  LineChartHeight?: number;
  YAxisTickFormatter?: string;
  YAxisLabel?: string;
  XAxisLabel?: string;
  XAxisHeight?: number;
  XAxisTickFormatter?: string;
  XAxisAngle?: number;
  strokeDasharray?: string;
  dy?: number;
  verticalAlign?: "top" | "middle" | "bottom";
  connectNulls?: boolean;
  tick?: any;
  onClick?: (e: any) => void;
}

export const CustomLineChart: React.FC<Props> = ({
  lineData,
  lineType,
  lineLayoutList,
  ContainerWidth,
  ContainerHeight,
  LineChartMargin,
  LineChartWidth,
  LineChartHeight,
  YAxisTickFormatter,
  YAxisLabel,
  XAxisLabel,
  XAxisHeight,
  XAxisTickFormatter,
  XAxisAngle,
  strokeDasharray,
  dy,
  verticalAlign,
  connectNulls,
  tick,
  onClick,
}) => {
  const lineHtml: Array<JSX.Element> = [];
  if (lineLayoutList) {
    for (let i = 0; i < Object.keys(lineLayoutList).length; i += 1) {
      lineHtml.push(
        <Line
          type={lineType}
          dataKey={lineLayoutList[i].dataKey}
          stroke={lineLayoutList[i].stroke}
          strokeWidth={lineLayoutList[i].strokeWidth}
          activeDot={{ r: 8 }}
          onClick={onClick}
          strokeDasharray={strokeDasharray}
          connectNulls={connectNulls}
        />
      );
    }
  }

  return (
    <ResponsiveContainer width={ContainerWidth} height={ContainerHeight}>
      <LineChart
        width={LineChartWidth}
        height={LineChartHeight}
        data={lineData}
        margin={LineChartMargin}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="XAxisName"
          label={XAxisLabel}
          height={XAxisHeight}
          tickFormatter={(value) =>
            XAxisTickFormatter === undefined
              ? `${value}`
              : `${value}${XAxisTickFormatter}`
          }
          angle={XAxisAngle}
          dy={dy}
          tick={tick}
        />
        <YAxis
          tickFormatter={(value) =>
            YAxisTickFormatter === undefined
              ? `${value}`
              : `${value}${YAxisTickFormatter}`
          }
          label={{
            value: YAxisLabel,
            angle: -90,
            position: "Left",
            fontSize: 18,
            // fontWeight: "bold",
            dx: -65,
          }}
          allowDecimals={true}
          tick={tick}
        />
        <Tooltip />
        <Legend
          verticalAlign={verticalAlign}
          wrapperStyle={{
            fontSize: 16,
            paddingBottom: 15,
            fontWeight: "bold",
          }}
        />
        {lineHtml}
      </LineChart>
    </ResponsiveContainer>
  );
};

// CustomLineChart.defaultProps = {
//   lineData: null,
//   lineType: null,
//   lineLayoutList: null,
//   ContainerWidth: null,
//   ContainerHeight: null,
//   LineChartMargin: null,
//   LineChartWidth: null,
//   LineChartHeight: null,
//   YAxisTickFormatter: null,
//   YAxisLabel: null,
//   XAxisLabel: null,
//   XAxisHeight: null,
//   XAxisTickFormatter: null,
//   XAxisAngle: null,
//   onClick: null,
// };
