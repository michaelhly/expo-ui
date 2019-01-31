import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import {
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  LineChart,
  Line
} from "recharts";

import "./chart.css";

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMarginCall: false
    };
  }

  onMouseLeaveMarginCall = () => {
    const { props } = this;
    props.onMarginCallOut();
    this.setState({ showMarginCall: false });
  };

  onMouseEnterMarginCall = () => {
    const { props } = this;
    props.onMarginCallIn();
    this.setState({ showMarginCall: true });
  };

  render() {
    const { props, state } = this;

    const {
      data,
      showBaseLine,
      marginCallPrice,
      onMouseMove,
      primaryColor,
      hideMarginCallLine
    } = props;

    const { showMarginCall } = state;

    let marginCallLineColor = "#ECECEC";
    const lineColor = primaryColor;
    let lineOpacity = 1;

    if (showMarginCall || props.showMarginCall) {
      marginCallLineColor = primaryColor;
      lineOpacity = 0.2;
    }

    let lowestPoint = Number.MAX_VALUE;
    let highestPoint = 0;
    data.forEach(p => {
      if (showBaseLine) {
        if (p.basePrice < lowestPoint) {
          lowestPoint = p.basePrice;
        }
        if (p.basePrice > highestPoint) {
          highestPoint = p.basePrice;
        }
      }
      if (p.marginTokenPrice < lowestPoint) {
        lowestPoint = p.marginTokenPrice;
      }
      if (p.marginTokenPrice > highestPoint) {
        highestPoint = p.marginTokenPrice;
      }
    });

    const delta = highestPoint - lowestPoint;

    const marginCallLine = Math.max(
      marginCallPrice,
      lowestPoint - delta * 0.25
    );

    return (
      <div className="chart-component">
        <LineChart
          width={1020}
          height={185}
          data={data}
          margin={{
            top: 20,
            right: 0,
            bottom: 20,
            left: 0
          }}
          onMouseMove={e => onMouseMove(_.get(e, "activePayload[0].payload"))}
        >
          {showBaseLine ? (
            <Line
              strokeWidth={2}
              type="natural"
              dot={false}
              activeDot={false}
              opacity={lineOpacity}
              dataKey="basePrice"
              stroke="#ECECEC"
              isAnimationActive={false}
            />
          ) : null}
          <Line
            strokeWidth={2}
            type="natural"
            dot={false}
            activeDot={false}
            opacity={lineOpacity}
            dataKey="marginTokenPrice"
            stroke={lineColor}
            isAnimationActive={false}
          />
          <YAxis
            dataKey="marginTokenPrice"
            hide
            domain={[marginCallLine, highestPoint]}
          />
          <XAxis hide dataKey="time" />
          {hideMarginCallLine ? null : (
            <ReferenceLine
              y={marginCallLine}
              stroke={marginCallLineColor}
              strokeDasharray="10 3"
            />
          )}
          {hideMarginCallLine ? null : (
            <ReferenceLine
              y={marginCallLine}
              strokeWidth={30}
              stroke="#ff0000"
              strokeOpacity={0}
              onMouseEnter={this.onMouseEnterMarginCall}
              onMouseLeave={this.onMouseLeaveMarginCall}
            />
          )}
          <Tooltip
            cursor={{
              stroke: primaryColor,
              strokeWidth: 1.5,
              strokeOpacity: showMarginCall ? 0 : 1,
              strokeDasharray: "10 3"
            }}
            content={() => null}
          />
        </LineChart>
      </div>
    );
  }
}

Chart.propTypes = {
  data: PropTypes.array,
  primaryColor: PropTypes.string.isRequired,
  showBaseLine: PropTypes.bool,
  onMouseMove: PropTypes.func,
  onMarginCallIn: PropTypes.func,
  onMarginCallOut: PropTypes.func,
  hideMarginCallLine: PropTypes.bool,
  marginCallPrice: PropTypes.number.isRequired,
  showMarginCall: PropTypes.bool.isRequired
};

Chart.defaultProps = {
  showBaseLine: false,
  hideMarginCallLine: false,
  onMouseMove: () => {},
  onMarginCallIn: () => {},
  onMarginCallOut: () => {}
};

Chart.defaultProps = {
  data: undefined
};

export default Chart;
