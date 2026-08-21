const config = require('./index');

const TON_CONFIG = Object.freeze({
  network: config.ton.network,
  endpoint: config.ton.endpoint,
  apiKey: config.ton.apiKey,
  jettonMasterAddress: config.ton.jettonMasterAddress,
  treasuryAddress: config.ton.treasuryAddress
});

function getTonConfig() {
  return {
    network: TON_CONFIG.network,
    endpoint: TON_CONFIG.endpoint,
    apiKeyConfigured: Boolean(TON_CONFIG.apiKey),
    jettonMasterConfigured: Boolean(TON_CONFIG.jettonMasterAddress),
    treasuryConfigured: Boolean(TON_CONFIG.treasuryAddress)
  };
}

function isMainnet() {
  return TON_CONFIG.network === 'mainnet';
}

function isTonConfigured() {
  return Boolean(
    TON_CONFIG.endpoint &&
    TON_CONFIG.jettonMasterAddress &&
    TON_CONFIG.treasuryAddress
  );
}

module.exports = {
  TON_CONFIG,
  getTonConfig,
  isMainnet,
  isTonConfigured
};
