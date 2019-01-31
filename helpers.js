import { DateTime } from "luxon";
import _ from "lodash";
import BigNumber from "bignumber.js";
import { dydx } from "./dydx";

import {
  TOKEN_DIGITS,
  ORDER_TYPE_0X,
  ORDER_TYPE_0X_V2,
  ORDER_TYPE_OASIS_V1,
  ORDER_TYPE_OASIS_V2,
  currencyAliases,
  POSITION_TYPE_SHORT
} from "./constants";

import { baseToNatural } from "./decimals";

export const DUST_AMOUNT = new BigNumber(10000000000);

export const truncateAddress = address => {
  let i = 0;
  if (address[0] === "0" && address[1] === "x") {
    i = 2;
  }
  return `0x${address.slice(i, i + 4)}...${address.slice(-4)}`;
};

export const truncateTransaction = hash => truncateAddress(hash);

export const getNaturalTokenString = (amountBaseBn, decimals) => {
  if (!amountBaseBn) {
    return "0.0000";
  }

  return baseToNatural(amountBaseBn, decimals).toFixed(
    TOKEN_DIGITS,
    BigNumber.ROUND_FLOOR
  );
};

export const MustBigNumber = amount => new BigNumber(amount || 0);

export const getExchangeWrapper = order => {
  switch (order.orderType) {
    case ORDER_TYPE_0X:
      return dydx.zeroExV1ExchangeWrapper;
    case ORDER_TYPE_0X_V2:
      return dydx.zeroExV2ExchangeWrapper;
    case ORDER_TYPE_OASIS_V1:
      return dydx.oasisV1SimpleExchangeWrapper;
    case ORDER_TYPE_OASIS_V2:
      return dydx.oasisV2SimpleExchangeWrapper;
    default:
      throw new Error("Unknown orderType");
  }
};

export const getOrderBytes = order => {
  const orderObject = JSON.parse(order.rawData);
  switch (order.orderType) {
    case ORDER_TYPE_0X:
      return dydx.zeroExV1ExchangeWrapper.zeroExOrderToBytes(orderObject);
    case ORDER_TYPE_0X_V2:
      return dydx.zeroExV2ExchangeWrapper.zeroExOrderToBytes(orderObject);
    case ORDER_TYPE_OASIS_V1:
      return dydx.oasisV1SimpleExchangeWrapper.orderIdToBytes(orderObject.id);
    case ORDER_TYPE_OASIS_V2:
      return dydx.oasisV2SimpleExchangeWrapper.orderIdToBytes(orderObject.id);
    default:
      throw new Error("Unknown orderType");
  }
};

export const getShortTokenName = symbol => symbol.split(" ")[0];

export const getNameDate = name => name.split(" ")[2];

export const getTokenNameNoDate = name =>
  `${name.split(" ")[0]} ${name.split(" ")[1]}`;

export const getCurrencyAlias = symbol => currencyAliases[symbol] || symbol;

export const getTime = _.memoize(() => DateTime.local());

export const getTimeFromISO = _.memoize(iso => DateTime.fromISO(iso));

export const getFormattedTimeFromISO = _.memoize(
  (iso, format) => DateTime.fromISO(iso).toLocaleString(format),
  (iso, format) => iso + format
);

export const getPositionColor = position => {
  if (position.type === POSITION_TYPE_SHORT) {
    return "#ff6a31";
  }
  return "#017bff";
};

export const isCancelTransactionError = error =>
  error &&
  error.message &&
  error.message.indexOf("User denied transaction signature") >= 0;

export const isRoughlyEqual = (a, b, amount) =>
  a
    .minus(b)
    .abs()
    .lte(amount);

export const isDustAmount = amount => amount.lt(DUST_AMOUNT);
