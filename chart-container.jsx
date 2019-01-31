/* eslint-disable jsx-a11y/mouse-events-have-key-events */

import React, { Component } from "react";
import BigNumber from "bignumber.js";
import classnames from "classnames";
import _ from "lodash";
import { connect } from "react-redux";
import { DateTime } from "luxon";
import Chart from "../chart/chart";
import Spinner from "../spinner/spinner";
import ToolTip from "../tooltip/tooltip";

import {
  POSITION_TYPE_LONG,
  POSITION_TYPE_SHORT,
  HELP_LINKS,
  POSITION_STATE_CLOSED
} from "../../lib/constants";

import {
  getTokenNameNoDate,
  getShortTokenName,
  getNameDate,
  getPositionColor
} from "../../lib/helpers";

import {
  getSelectedPositionMarginCallPrice,
  getMarginTokenPriceNowUsd,
  getSelectedPositionBasePriceUsdNowNumber,
  getSelectedPositionQuotePriceUsdNowNumber,
  getSelectedPositionBasePriceQuoteNowNumber,
  getSelectedPosition24HourPriceChange,
  getSelectedPosition24HourPriceChangeBase,
  getSelectedPositionInterestPercent as getSelectedPositionInterestPercentSelector,
  getLeverageRatio as getLeverageRatioSelector
} from "../../selectors/price";

import { getSelectedPosition } from "../../selectors/positions";

import {
  getChartStartDateString,
  getChartEndDateString,
  getComputedSelectedPositionChartData
} from "../../selectors/chart";

import "./chart-container.css";

class ChartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curPoint: undefined,
      marginCallHover: false,
      marginToolTipHover: false,
      aboutPriceHover: false,
      priceToolTipHover: false,
      expirationHover: false,
      expirationToolTipHover: false
    };
  }

  onMarginCallIn = () => {
    this.setState({ marginCallHover: true });
  };

  onMarginCallOut = () => {
    this.setState({ marginCallHover: false });
  };

  getExpiryTime() {
    const { props } = this;
    const { curPosition } = props;

    if (curPosition.state === POSITION_STATE_CLOSED) {
      return null;
    }

    const expirationTime = DateTime.fromISO(curPosition.positionExpiresAt);
    const { days } = expirationTime.diff(DateTime.local(), "days");
    const { hours } = expirationTime.diff(DateTime.local(), "hours");

    let unit;
    let amount;

    if (hours <= 24) {
      unit = "Hour";
      amount = Math.floor(hours);
    } else {
      unit = "Day";
      amount = Math.floor(days);
    }
    const plural = amount === 1 ? "" : "s";

    return `Expires in ${amount} ${unit}${plural}`;
  }

  onMouseMove = e => {
    const { state } = this;
    if (e === undefined && state.curPoint) {
      this.setState({ curPoint: undefined });
    } else if (e !== undefined) {
      this.setState({ curPoint: e });
    }
  };

  onMouseOut = () => {
    this.setState({ curPoint: undefined });
  };

  onMouseEnterAboutPrice = () => {
    this.setState({ aboutPriceHover: true });
  };

  onMouseLeaveAboutPrice = () => {
    this.setState({ aboutPriceHover: false });
  };

  onMouseEnterPriceToolTip = () => {
    this.setState({ priceToolTipHover: true });
  };

  onMouseLeavePriceToolTip = () => {
    this.setState({ priceToolTipHover: false });
  };

  onMouseEnterMarginToolTip = () => {
    this.setState({ marginToolTipHover: true });
  };

  onMouseLeaveMarginToolTip = () => {
    this.setState({ marginToolTipHover: false });
  };

  onMouseEnterExpiration = () => {
    this.setState({ expirationHover: true });
  };

  onMouseLeaveExpiration = () => {
    this.setState({ expirationHover: false });
  };

  onMouseEnterExpirationToolTip = () => {
    this.setState({ expirationToolTipHover: true });
  };

  onMouseLeaveExpirationToolTip = () => {
    this.setState({ expirationToolTipHover: false });
  };

  renderExpiresToolTip() {
    const { props } = this;
    const { curPosition } = props;

    const formattedTime = DateTime.fromISO(
      curPosition.positionExpiresAt
    ).toLocaleString(DateTime.DATETIME_FULL);
    return (
      <div className="tooltip-container expires-tt">
        <div
          className="tooltip-wrapper"
          onMouseEnter={this.onMouseEnterExpirationToolTip}
          onMouseLeave={this.onMouseLeaveExpirationToolTip}
        >
          <ToolTip link={HELP_LINKS.EXPIRES} title="Expiration">
            Each token has a set expiration date. On expiration, the token will
            automatically settle at the market price.
            <br />
            <br />
            This token will expire <b>{formattedTime}</b>.
          </ToolTip>
        </div>
      </div>
    );
  }

  renderPriceToolTip() {
    const { props } = this;

    const {
      curPosition,
      interestPercent,
      quotePrice,
      basePrice,
      price,
      getLeverageRatio
    } = props;

    if (!quotePrice || !price) {
      return null;
    }

    const renderShortText = () => {
      const initialPrice = new BigNumber(curPosition.initialCollateral).div(
        new BigNumber(curPosition.initialPrincipal)
      );
      const initialPriceQuote = initialPrice.toFixed(2);
      return (
        <div>
          sETH is a token representing a short position on ETH. Whenever ETH
          goes down $1, sETH gains $1 in value and vice versa.
          {curPosition.state === POSITION_STATE_CLOSED ? null : (
            <span>
              <br />
              <br />
              The price of {getShortTokenName(curPosition.token.symbol)}{" "}
              {getNameDate(curPosition.name)} is calculated as{" "}
              <b>
                {initialPriceQuote}
                {
                  " DAI * Current Price of DAI - Interest * Current Price of ETH"
                }
              </b>
              <br />
              The current price is:{" "}
              <b>
                {initialPriceQuote}
                {" DAI * $"}
                {quotePrice}
                {" - "}
                {interestPercent.toFixed(4)}
                {" * $"}
                {basePrice} = ${price.toFixed(2)}
              </b>
            </span>
          )}
        </div>
      );
    };

    const renderLongText = () => {
      const leverageRatio = getLeverageRatio(curPosition).toFixed(2);

      const initialPrice = new BigNumber(curPosition.initialPrincipal)
        .div(new BigNumber(curPosition.initialCollateral))
        .toFixed(2);
      return (
        <div>
          LETH is a token representing a leveraged long position on ETH. LETH
          moves at a multiple of the price of ETH (currently {leverageRatio}
          x).
          {curPosition.state === POSITION_STATE_CLOSED ? null : (
            <span>
              <br />
              <br />
              The price of {getShortTokenName(curPosition.token.symbol)}{" "}
              {getNameDate(curPosition.name)} is calculated as{" "}
              <b>
                {"Current Price of ETH"}
                {" - "}
                {initialPrice}
                {" DAI "}* Interest * Current Price of DAI
              </b>
              <br />
              The current price is:{" "}
              <b>
                {"$"}
                {basePrice}
                {" - "}
                {initialPrice}
                {" DAI "} * {interestPercent.toFixed(4)}
                {" * "}
                {quotePrice} = ${price.toFixed(2)}
              </b>
            </span>
          )}
        </div>
      );
    };

    return (
      <div className="tooltip-container price-tt">
        <div
          className="tooltip-wrapper"
          onMouseEnter={this.onMouseEnterPriceToolTip}
          onMouseLeave={this.onMouseLeavePriceToolTip}
        >
          <ToolTip
            link={HELP_LINKS.PRICE}
            title={`${getTokenNameNoDate(curPosition.name)}
              (${getShortTokenName(curPosition.token.symbol)})`}
          >
            {curPosition.type === POSITION_TYPE_SHORT
              ? renderShortText()
              : renderLongText()}
          </ToolTip>
        </div>
      </div>
    );
  }

  renderMarginCallToolTip() {
    const { props } = this;

    const { marginCallPriceNumber, curPosition } = props;

    return (
      <div className="tooltip-container margin-tt">
        <div
          className="tooltip-wrapper"
          onMouseEnter={this.onMouseEnterMarginToolTip}
          onMouseLeave={this.onMouseLeaveMarginToolTip}
        >
          <ToolTip
            link={HELP_LINKS.MARGIN_CALL}
            title="Margin Call"
            cornerText={`$${marginCallPriceNumber.toFixed(2)}`}
            cornerTextColor={getPositionColor(curPosition)}
          >
            If the price of {getShortTokenName(curPosition.token.symbol)} falls
            below this number, the position will be margin called and
            automatically closed at the market price.
          </ToolTip>
        </div>
      </div>
    );
  }

  render() {
    const { state, props } = this;

    const {
      chartData,
      curPosition,
      price,
      basePrice,
      priceChange,
      baseChange,
      marginCallPriceNumber,
      chartStartDateString,
      chartEndDateString
    } = props;

    const {
      marginToolTipHover,
      priceToolTipHover,
      aboutPriceHover,
      marginCallHover,
      expirationToolTipHover,
      expirationHover,
      curPoint,
      priceHover
    } = state;

    if (!curPosition) {
      return (
        <div className="chart-container-component">
          <Spinner />
        </div>
      );
    }

    const primaryColor =
      curPosition.type === POSITION_TYPE_LONG ? "#017bff" : "#ff6a31";

    const classNames = classnames("chart-container-component", {
      "show-margin-call": marginToolTipHover || marginCallHover
    });

    const aboutPriceSelected = classnames("about-price", {
      selected: priceToolTipHover || priceHover
    });

    const dateCurClassNames = classnames("date-cur", {
      "date-cur-selected": expirationToolTipHover || expirationHover
    });

    return (
      <div className={classNames}>
        {marginToolTipHover || marginCallHover
          ? this.renderMarginCallToolTip()
          : null}
        {priceToolTipHover || aboutPriceHover
          ? this.renderPriceToolTip()
          : null}
        {expirationToolTipHover || expirationHover
          ? this.renderExpiresToolTip()
          : null}
        <div className="price-container">
          <div
            className={aboutPriceSelected}
            onMouseEnter={this.onMouseEnterAboutPrice}
            onMouseLeave={this.onMouseLeaveAboutPrice}
          >
            {`ABOUT ${getShortTokenName(curPosition.token.symbol)} PRICE`}
          </div>
          <div className="price">
            $
            {curPoint
              ? curPoint.marginTokenPrice.toFixed(2)
              : price && price.toFixed(2)}
          </div>
          <div className="icon">
            {curPosition.type === POSITION_TYPE_LONG ? (
              <img alt="icon" src="/leth-small.svg" />
            ) : (
              <img alt="icon" src="/seth-small.svg" />
            )}
          </div>
          {priceChange ? (
            <div className="arrow">
              {priceChange.gt(new BigNumber(0)) ? (
                <img alt="icon" src="/graph-arrow-up.svg" />
              ) : (
                <img alt="icon" src="/graph-arrow-down.svg" />
              )}
            </div>
          ) : null}
        </div>
        <div className="base-price-container">
          <div className="base-price">
            $
            {curPoint
              ? curPoint.basePrice.toFixed(2)
              : basePrice && basePrice.toFixed(2)}{" "}
            ETH
          </div>
          {baseChange ? (
            <div className="arrow">
              {baseChange.gt(new BigNumber(0)) ? (
                <img alt="icon" src="/graph-arrow-up.svg" />
              ) : (
                <img alt="icon" src="/graph-arrow-down.svg" />
              )}
            </div>
          ) : null}
        </div>
        <div className="chart" onMouseOut={this.onMouseOut}>
          {chartData ? (
            <Chart
              data={chartData}
              hideMarginCallLine={!!curPosition.positionClosedAt}
              showBaseLine={false}
              marginCallPrice={marginCallPriceNumber}
              onMouseMove={this.onMouseMove}
              onMarginCallIn={this.onMarginCallIn}
              onMarginCallOut={this.onMarginCallOut}
              primaryColor={primaryColor}
              showMarginCall={marginToolTipHover}
            />
          ) : (
            <div className="chart-component">
              <Spinner />
            </div>
          )}
        </div>
        <div className="bottom-info">
          <div className="date-start">{chartStartDateString}</div>
          <div
            className={dateCurClassNames}
            onMouseEnter={this.onMouseEnterExpiration}
            onMouseLeave={this.onMouseLeaveExpiration}
          >
            {curPoint ? curPoint.timeString : this.getExpiryTime()}
          </div>
          <div className="date-end">{chartEndDateString}</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  curPosition: getSelectedPosition(state),
  price: (() =>
    getMarginTokenPriceNowUsd(
      state,
      _.get(state, "positions.selectedPosition.id", new BigNumber(0))
    ))(),
  basePrice: getSelectedPositionBasePriceUsdNowNumber(state),
  basePriceQuote: getSelectedPositionBasePriceQuoteNowNumber(state),
  quotePrice: getSelectedPositionQuotePriceUsdNowNumber(state),
  priceChange: getSelectedPosition24HourPriceChange(state),
  baseChange: getSelectedPosition24HourPriceChangeBase(state),
  chartStartDateString: getChartStartDateString(state),
  chartEndDateString: getChartEndDateString(state),
  interestPercent: getSelectedPositionInterestPercentSelector(state),
  chartData: getComputedSelectedPositionChartData(state),
  getLeverageRatio: position => getLeverageRatioSelector(state, position.id),
  marginCallPriceNumber:
    getSelectedPositionMarginCallPrice(state) &&
    getSelectedPositionMarginCallPrice(state).toNumber()
});

export default connect(mapStateToProps)(ChartContainer);
