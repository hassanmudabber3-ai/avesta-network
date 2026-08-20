const TON_NETWORK = process.env.TON_NETWORK || 'testnet';

const TON_ENDPOINT =
  process.env.TON_ENDPOINT ||
  (TON_NETWORK === 'mainnet'
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC');

const TON_API_KEY = process.env.TON_API_KEY || '';

const TON_CONFIG = {
  network: TON_NETWORK,
  endpoint: TON_ENDPOINT,
  apiKey: TON_API_KEY,
  jettonMasterAddress: process.env.AVC_JETTON_MASTER_ADDRESS || '',
  treasuryAddress: process.env.AVC_TREASURY_ADDRESS || ''
};

function getTonConfig() {
  return {
    ...TON_CONFIG,
    apiKey: TON_CONFIG.apiKey ? '[configured]' : '[not configured]'
  };
}

function isMainnet() {
  return TON_CONFIG.network === 'mainnet';
}

function isTonConfigured() {
  return Boolean(
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
