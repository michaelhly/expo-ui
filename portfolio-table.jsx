import BigNumber from 'bignumber.js';
import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import PortfolioItem from './portfolio-item';
import './portfolio-table.css';

import {
  TOKEN_DIGITS,
  POSITION_STATE_CLOSED,
  POSITION_STATE_ACTIVE,
  POSITION_STATE_INACTIVE,
} from '../../lib/constants';

import {
  baseToNatural,
} from '../../lib/decimals';

import {
  selectPosition,
} from '../../actions/positions';

import {
  getMarginTokenPriceNowUsd as getMarginTokenPriceNowUsdSelector,
  get24HourPriceChange as get24HourPriceChangeSelector,
  getCurrentAssetPrice as getCurrentAssetPriceSelector,
  getLeverageRatio as getLeverageRatioSelector,
} from '../../selectors/price';

import {
  getWeightedAverageCost as getWeightedAverageCostSelector,
} from '../../selectors/transfers';

import {
  getTokenBalance,
} from '../../selectors/user';

import {
  isRoughlyEqual,
  isDustAmount,
  MustBigNumber,
} from '../../lib/helpers';

class PortfolioTable extends Component {
  onClickPositionItem(position) {
    const { props } = this;
    props.selectPosition(position);
  }

  getPriceChangeString(id) {
    const { getPriceChange } = this.props;
    const change = getPriceChange(id);
    return (change && change.toFixed(2)) || '';
  }

  getPriceStringUsd(position) {
    const { getMarginTokenPriceUsd } = this.props;
    const price = getMarginTokenPriceUsd(position.id);
    return (price && price.toFixed(2, BigNumber.ROUND_FLOOR)) || '';
  }

  getPositionBalanceNaturalString(position) {
    return this.getPositionBalanceNatural(position).toFixed(TOKEN_DIGITS, BigNumber.ROUND_FLOOR);
  }

  getPositionBalanceNatural(position) {
    const { props } = this;
    const {
      getPositionBalance,
    } = props;

    return baseToNatural(
      getPositionBalance(position),
      position.token.decimals,
    );
  }

  getPositionTotalValueStringUsd(position) {
    const { props } = this;
    const {
      getMarginTokenPriceUsd,
    } = props;

    const positionBalance = this.getPositionBalanceNatural(position);
    const price = getMarginTokenPriceUsd(position.id);

    if (!price || !positionBalance) {
      return '0.00';
    }

    return positionBalance.mul(price).toFixed(2, BigNumber.ROUND_FLOOR);
  }

  getLeverageRatio(position) {
    const { props } = this;

    const {
      getLeverageRatio,
    } = props;

    const ratio = getLeverageRatio(position);

    if (!ratio) {
      return null;
    }

    return ratio.toFixed(2);
  }

  renderPortfolioItems() {
    const { props } = this;

    const {
      positions = [],
    } = props;

    return positions.map(position => this.renderPortfolioItem(position));
  }

  renderPortfolioItem(position) {
    const { props } = this;
    const {
      selectedPosition,
      getPositionBalance,
      getWeightedAverageCost,
    } = props;

    if (!position.token) {
      return null;
    }

    const balance = getPositionBalance(position);
    const { getMarginTokenPriceUsd } = this.props;
    const price = getMarginTokenPriceUsd(position.id);
    const avg = getWeightedAverageCost(position.id);

    let unrealizedGains = '0';

    if (parseFloat(this.getPositionBalanceNaturalString(position)) > 0
      && price
      && avg.totalTokens.gt(0)
      && isRoughlyEqual(avg.totalTokens, balance, 100)
    ) {
      const averagePrice = avg.averagePrice.div(100);
      unrealizedGains = price
        .sub(averagePrice)
        .div(averagePrice)
        .mul(100)
        .toFixed(2);
    }

    if (position.state === POSITION_STATE_ACTIVE) {
      return (
        <PortfolioItem
          onClick={() => this.onClickPositionItem(position)}
          key={position.id}
          selected={selectedPosition && position.id === selectedPosition.id}
          name={position.name}
          unrealizedGains={unrealizedGains}
          value={this.getPositionTotalValueStringUsd(position)}
          price={this.getPriceStringUsd(position)}
          leverage={this.getLeverageRatio(position)}
          owned={this.getPositionBalanceNaturalString(position)}
          change={this.getPriceChangeString(position.id)}
          isClosing={position.isClosing}
          type={position.type}
        />
      );
    }

    if (position.state === POSITION_STATE_CLOSED) {
      const balanceBn = MustBigNumber(balance);
      if (!balanceBn || balanceBn.eq(0) || isDustAmount(balanceBn)) {
        return null;
      }

      return (
        <PortfolioItem
          onClick={() => this.onClickPositionItem(position)}
          key={position.id}
          selected={selectedPosition && position.id === selectedPosition.id}
          name={position.name}
          value={this.getPositionTotalValueStringUsd(position)}
          price={this.getPriceStringUsd(position)}
          unrealizedGains={unrealizedGains}
          owned={this.getPositionBalanceNaturalString(position)}
          change={this.getPriceChangeString(position.id)}
          onClickWithdraw={
            () => props.history.replace(`/trade/withdraw?id=${_.get(position, 'id')}`)
          }
          type={position.type}
          isClosed
        />
      );
    }

    if (position.state === POSITION_STATE_INACTIVE) {
      return null;
    }

    return null;
  }

  render() {
    return (
      <div className="component-portfolio-table">
        <div className="position-titles">
          <div className="column-label column-name">
            token
          </div>
          <div className="column-label column-ratio">
            leverage
          </div>
          <div className="column-label column-price">
            price
          </div>
          <div className="column-label column-change">
            24 hour
          </div>
          <div className="column-label column-owned">
            owned
          </div>
          <div className="column-label column-value">
            value
          </div>
          <div className="column-label column-gains">
            unrealized PNL
          </div>
        </div>
        <div className="position-items">
          {
            this.renderPortfolioItems()
          }
        </div>
      </div>
    );
  }
}


PortfolioTable.propTypes = {
  positions: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedPosition: PropTypes.object,
  getPriceChange: PropTypes.func.isRequired,
  getMarginTokenPriceUsd: PropTypes.func.isRequired,
  getPositionBalance: PropTypes.func.isRequired,
};

PortfolioTable.defaultProps = {
  selectedPosition: undefined,
};

const mapStateToProps = state => ({
  positions: state.positions.positions,
  selectedPosition: state.positions.selectedPosition,
  getWeightedAverageCost: positionId =>
    getWeightedAverageCostSelector(state.transfers.transfers, positionId),
  getCurrentAssetPrice: (base, quote) => getCurrentAssetPriceSelector(state, base, quote),
  getLeverageRatio: position => getLeverageRatioSelector(
    state,
    position.id,
  ),
  getMarginTokenPriceUsd: id => getMarginTokenPriceNowUsdSelector(state, id),
  getPriceChange: id => get24HourPriceChangeSelector(state, id),
  getPositionBalance: (position) => {
    if (!position) return new BigNumber(0);
    const balance = getTokenBalance(state, position.token.contractAddress);
    if (!balance) return new BigNumber(0);
    return balance;
  },
});

const mapDispatchToProps = dispatch => bindActionCreators({
  selectPosition,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(PortfolioTable));

export { PortfolioTable as Component };
