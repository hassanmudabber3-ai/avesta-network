const pointsModel = require('../models/points.model');

const asyncHandler =
  require('../utils/asyncHandler');

const { success } =
  require('../utils/response');

const transferPoints = asyncHandler(async (req, res) => {
  const { telegramId, amount } = req.body;

  if (!telegramId) {
    return res.status(400).json({
      success: false,
      message: 'Telegram ID is required'
    });
  }

  const result = await pointsModel.transferPoints({
    senderId: req.user.id,
    receiverTelegramId: telegramId,
    amount
  });

  if (!result.success) {
    const messages = {
      INVALID_AMOUNT: 'مقدار AVC باید عدد صحیح باشد',
      AMOUNT_OUT_OF_RANGE: 'مقدار ارسال باید بین 100 و 1000 AVC باشد',
      SENDER_NOT_FOUND: 'حساب فرستنده فعال نیست',
      RECEIVER_NOT_FOUND: 'کاربر گیرنده پیدا نشد',
      SELF_TRANSFER: 'نمی‌توانید برای خودتان AVC ارسال کنید',
      INSUFFICIENT_BALANCE: 'موجودی AVC کافی نیست'
    };

    const status =
      result.code === 'RECEIVER_NOT_FOUND' ? 404 :
      result.code === 'INSUFFICIENT_BALANCE' ? 400 :
      400;

    return res.status(status).json({
      success: false,
      code: result.code,
      message: messages[result.code] || 'Transfer failed',
      balance: result.balance
    });
  }

  return success(
    res,
    result,
    'Points transferred successfully'
  );
});

const getPoints = asyncHandler(async (req, res) => {
  const balance =
    await pointsModel.getBalance(req.user.id);

  const transactions =
    await pointsModel.getTransactions(req.user.id);

  return success(
    res,
    {
      balance,
      transactions
    },
    'Points retrieved successfully'
  );
});

module.exports = {
  getPoints,
  transferPoints
};
