import React from 'react';
import './wallet-info.css';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { WALLET_STATES } from '../../lib/constants';
import { truncateAddress } from '../../lib/helpers';

const WalletInfo = ({ walletStatus, address }) => {
  let label;
  let value;
  let indicatorColor = '';

  switch (walletStatus) {
    case WALLET_STATES.NOT_LOADED: {
      label = 'Loading Wallet..';
      indicatorColor = 'loading';
      break;
    }
    case WALLET_STATES.NO_WALLET: {
      label = 'No Wallet Found';
      indicatorColor = 'warning';
      break;
    }
    case WALLET_STATES.INCORRECT_NETWORK: {
      label = 'Incorrect Network';
      indicatorColor = 'warning';
      break;
    }
    case WALLET_STATES.READY: {
      label = 'MetaMask';
      value = address;
      indicatorColor = 'success';
      break;
    }
    case WALLET_STATES.NO_ACCOUNTS: {
      // Handle Metamask Privacy Mode
      return (
        <div
          className="component-wallet-info privacy"
          onClick={() => window.ethereum.enable()}
          role="button"
          tabIndex={0}
        >
          <div className="indicator" />
          <div className="label">
            Connect Wallet
          </div>
        </div>
      );
    }
    default: {
      label = 'Not Connected';
      indicatorColor = 'warning';
    }
  }

  const indicatorClass = classnames('indicator', indicatorColor);

  return (
    <div className="component-wallet-info">
      <div className={indicatorClass} />
      <div className="label">
        {label}
      </div>
      <div className="value">
        {value && truncateAddress(value)}
      </div>
    </div>
  );
};

WalletInfo.propTypes = {
  walletStatus: PropTypes.number.isRequired,
  address: PropTypes.string,
};

WalletInfo.defaultProps = {
  address: undefined,
};

export default WalletInfo;
