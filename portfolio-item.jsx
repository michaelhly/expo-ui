import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './portfolio-item.css';

import Button from '../button/button';

import {
  POSITION_TYPE_LONG,
} from '../../lib/constants';

const PositionItem = ({
  type,
  price,
  selected,
  value,
  owned,
  name,
  onClick,
  change,
  leverage,
  isClosing,
  isClosed,
  onClickWithdraw,
  unrealizedGains,
}) => {
  const classNames = classnames(
    'component-portfolio-item',
    {
      selected,
      'is-closed': isClosed,
    },
  );

  const changeClass = classnames(
    'column',
    'column-change',
    {
      negative: parseFloat(change) < 0,
      positive: parseFloat(change) > 0,
    },
  );

  const gainsClass = classnames(
    'column',
    'column-gains',
    {
      negative: parseFloat(unrealizedGains) < 0,
      positive: parseFloat(unrealizedGains) > 0,
    },
  );

  const renderGainsField = () => {
    if (isClosed) {
      return (
        <div className="column column-gains">
          <Button onClick={onClickWithdraw} className="withdraw-button">Withdraw</Button>
        </div>
      );
    }

    if (parseFloat(unrealizedGains) === 0) {
      return (
        <div className="column column-gains">
          –
        </div>
      );
    }

    return (
      <div className={gainsClass}>
        { parseFloat(unrealizedGains) > 0 ? '+' : '' }
        { unrealizedGains }
        %
      </div>
    );
  };

  const renderOwnedField = () => {
    if (parseFloat(owned) === 0) {
      return (
        <div className="column column-owned">
          –
        </div>
      );
    }

    return (
      <div className="column column-owned">
        { owned }
      </div>
    );
  };

  const renderChangeField = () => {
    if (!change) {
      return (
        <div className="column column-change">
          –
        </div>
      );
    }
    if (isClosed) {
      return (
        <div className="column column-change">
          –
        </div>
      );
    }

    if (isClosing) {
      return (
        <div className="column column-change closing">
          Closing
        </div>
      );
    }

    return (
      <div className={changeClass}>
        { parseFloat(change) > 0 ? '+' : '' }
        { change }
        %
      </div>
    );
  };

  return (
    <div className={classNames} role="button" tabIndex={0} onClick={onClick}>
      <div className="column column-name">
        <div className="icon-container">
          { type === POSITION_TYPE_LONG
            ? <img alt="icon" className="icon" src="/leth-small.svg" />
            : <img alt="icon" className="icon" src="/seth-small.svg" />
          }
        </div>
        { name }
      </div>
      <div className="column column-ratio">
        { leverage ? `${leverage}x` : '–' }
      </div>
      <div className="column column-price">
        $
        {price && price.toString()}
      </div>
      { renderChangeField() }
      { renderOwnedField() }
      <div className="column column-value">
        { parseFloat(value) === 0 ? '–' : `$${value}`}
      </div>
      { renderGainsField() }
    </div>
  );
};

PositionItem.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  leverage: PropTypes.string.isRequired,
  owned: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onClickWithdraw: PropTypes.func.isRequired,
  isClosed: PropTypes.bool,
  unrealizedGains: PropTypes.string.isRequired,
  isClosing: PropTypes.bool,
};

PositionItem.defaultProps = {
  selected: false,
  isClosed: false,
  isClosing: false,
};

export default PositionItem;
