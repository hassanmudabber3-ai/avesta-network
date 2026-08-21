const contractModel =
  require('../models/influencer-contract.model');

const asyncHandler =
  require('../utils/asyncHandler');

const {
  success,
  error,
  notFound
} = require('../utils/response');

const getMyContracts = asyncHandler(async (req, res) => {
  const contracts =
    await contractModel.getMyContracts(req.user.id);

  return success(
    res,
    contracts,
    'Influencer contracts retrieved successfully'
  );
});

const acceptContract = asyncHandler(async (req, res) => {
  const contract =
    await contractModel.accept(
      req.params.id,
      req.user.id
    );

  if (!contract) {
    return error(
      res,
      'Contract not found or cannot be accepted',
      400
    );
  }

  return success(
    res,
    contract,
    'Contract accepted successfully'
  );
});

const rejectContract = asyncHandler(async (req, res) => {
  const contract =
    await contractModel.reject(
      req.params.id,
      req.user.id
    );

  if (!contract) {
    return error(
      res,
      'Contract not found or cannot be rejected',
      400
    );
  }

  return success(
    res,
    contract,
    'Contract rejected successfully'
  );
});

module.exports = {
  getMyContracts,
  acceptContract,
  rejectContract
};
