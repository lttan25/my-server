import axios from 'axios';
import log4js from 'log4js';
import { tokenService } from '../services/database.js';
import config from 'config';

const logger = log4js.getLogger('webhook-handler');
const DNSE_CONFIG = config.dnse;

/**
 * curl --location --request POST 'https://api.dnse.com.vn/order-service/v2/orders' \
 * --header 'authorization: Bearer <jwt_token_from_login_API_response_step_2.1>' \
 * --header 'content-type: application/json' \
 * --header 'trading-token: <trading_token_from_step_2.2>' \
 * --data '{"symbol":"<your_symbol>","side":"<your_order_side>","orderType":"<your_order_type>","price":<your_order_price>,"quantity":<your_order_quantity>,"loanPackageId":<your_order_loan_package>,"accountNo":"<your_account>"}'
 * 
 * Detail:
 * [Resquest body]
 * Field
 * Type
 * Description
 * 
 * symbol
 * String
 * Mã
 * 
 * side
 * String
 * Lệnh mua: NB, Lệnh bán:NS
 * 
 * orderType
 * String
 * Loại lệnh: LO/MP/MTL/ATO/ATC/MOK/MAK
 * 
 * price
 * Double
 * Giá, đơn vị đồng
 * 
 * quantity
 * Double
 * Khối lượng đặt
 * 
 * loanPackageId
 * Double
 * Mã gói vay, lấy gói vay muốn đặt từ api danh sách gói vay
 * 
 * accountNo
 * String
 * Mã tiểu khoản
 * 
 * [Response body]
 * Field
 * Type
 * Description
 * 
 * id 
 * integer 
 * Số hiệu lệnh 
 * 
 * side 
 * string 
 * Lệnh Mua/Bán thuộc các giá trị sau: 
 * - NB: Mua 
 * - NS: Bán 
 * 
 * accountNo 
 * string 
 * Số tiểu khoản 
 * 
 * investorId 
 * string 
 * Mã Khách hàng 
 * 
 * symbol 
 * string 
 * Mã chứng khoán 
 * 
 * price 
 * number 
 * Giá đặt 
 * 
 * quantity 
 * integer 
 * Khối lượng đặt 
 * 
 * orderType 
 * string 
 * Loại lệnh, thuộc các giá trị sau: 
 * - LO: lệnh giới hạn 
 * - MP/MTL: lệnh thị trường 
 * - ATC/ATO: lệnh khớp phiên định kỳ đóng cửa/mở cửa 
 * - PLO: lệnh khớp lệnh sau giờ 
 * 
 * orderStatus 
 * string 
 * Trạng thái lệnh, thuộc các giá trị sau đây: 
 * - pending: chờ gửi 
 * - pendingNew: chờ gửi 
 * - new: chờ khớp 
 * - partiallyFilled: khớp một phần 
 * - filled: khớp toàn bộ 
 * - rejected: bị từ chối 
 * - expired: bị hết hạn trong phiên 
 * - doneForDay: lệnh hết hiệu lực khi hết phiên 
 * 
 * fillQuantity 
 * integer 
 * Khối lượng đã khớp 
 * 
 * lastQuantity 
 * integer 
 * Khối lượng của lần khớp gần nhất của lệnh 
 * 
 * lastPrice 
 * number 
 * Giá khớp của lần khớp gần nhất của lệnh 
 * 
 * averagePrice 
 * double 
 * Giá khớp trung bình của lệnh 
 * 
 * transDate 
 * string 
 * Ngày giao dịch, theo định dạng ISO UTC 8601 format date 
 * Ví dụ: 2022-07-15 
 * 
 * createdDate 
 * string 
 * Thời điểm (ngày giờ) đặt lệnh, theo định dạng ISO UTC 8601 format datetime 
 * Ví dụ: 2022-07-15T10:00:00.111+07:00 
 * 
 * modifiedDate 
 * string 
 * Thời điểm (ngày giờ) thay đổi cuối cùng của lệnh 
 * 
 * taxRate 
 * double 
 * Tỷ lệ thuế lệnh chịu 
 * 
 * feeRate 
 * double 
 * Tỷ lệ phí lệnh chịu 
 * 
 * leaveQuantity 
 * integer 
 * Khối lượng chưa khớp của lệnh 
 * 
 * canceledQuantity 
 * integer 
 * Khối lượng đã huỷ của lệnh 
 * 
 * priceSecure 
 * double 
 * Giá cọc cho lệnh 
 * 
 * custody 
 * string 
 * Số lưu ký của tiểu khoản đặt lệnh 
 * 
 * channel 
 * string 
 * Kênh đặt lệnh 
 * 
 * loanPackageId 
 * integer 
 * Id gói vay 
 * 
 * initialRate 
 * number 
 * Tỷ lệ ký quỹ theo gói vay tương ứng với lệnh 
 * 
 * error 
 * string 
 * Mã lỗi với trạng thái expired 
 * 0: Lệnh MP không có lệnh đối ứng 
 * Mã lỗi đối với trạng thái lệnh rejected (bị từ chối) bao gồm các mã lỗi: 
 * QMAX_EXCEED: Vượt quá KL có thể mua/bán 
 * INVALID_QUANTITY_LOT: KL đặt không hợp lệ 
 * PRICE_MUST_GREATER_THAN_OR_EQUAL_TO_FLOOR_PRICE: Giá đặt không hợp lệ 
 * PRICE_MUST_LESS_THAN_OR_EQUAL_TO_CEILING_PRICE: Giá đặt không hợp lệ 
 * INVALID_PRICE_LOT: Giá đặt không hợp lệ 
 * SYMBOL_IS_NOT_IN_MARGIN_BASKET: Mã không nằm trong rổ margin 
 */
export async function handleTradingWebhook(req, res) {
  console.log(req.body);
  const { symbol, action, volume, price, orderType = "LO", loanPackageId } = req.body;
  try {
    const tokenRow = await tokenService.getLatestToken();
    if (!tokenRow || Math.floor(Date.now() / 1000) > tokenRow.expires_at) {
      logger.warn('Token expired or missing');
      return res.status(401).send("Token hết hạn hoặc chưa có");
    }


    // If orderType is not ["NB", "NS"], throw an error
    if (!["buy", "sell"].includes(action)) {
      logger.error('Invalid action:', action);
      return res.status(400).send("Hành động không hợp lệ");
    }

    // If orderType is not in ["LO", "MP", "MTL", "ATO", "ATC", "MOK", "MAK"] throw an error
    if (!["LO", "MP", "MTL", "ATO", "ATC", "MOK", "MAK"].includes(orderType)) {
      logger.error('Invalid order type:', orderType);
      return res.status(400).send("Loại lệnh không hợp lệ");
    }

    // If price is not a number, throw an error
    if (price && isNaN(price)) {
      logger.error('Invalid price:', price);
      return res.status(400).send("Giá không hợp lệ");
    }

    // Map buy/sell action to NB/NS according to API spec
    const orderPayload = {
      symbol,
      side: action === "buy" ? "NB" : "NS", // NB for buy, NS for sell
      orderType: ["LO", "MP", "MTL", "ATO", "ATC", "MOK", "MAK"].includes(orderType) ? orderType : "LO",
      price: typeof price === 'number' ? parseFloat(price) : 0, // Default to 0 if price is not provided
      quantity: parseFloat(volume), // Convert to Double as per API spec
      loanPackageId: loanPackageId ? parseFloat(loanPackageId) : undefined, // Optional field
      accountNo: process.env.TRADING_ACCOUNT_ID
    };
    
    logger.info('Placing order:', { ...orderPayload, tradingToken: tokenRow.trading_token?.slice(0, 10) });
    const response = await axios.post(
      `${DNSE_CONFIG.baseUrl}${DNSE_CONFIG.apis.orders}`,
      orderPayload,
      {
        headers: {
          'authorization': `Bearer ${tokenRow.jwt}`,
          'content-type': 'application/json',
          'trading-token': tokenRow.trading_token
        }
      }
    );

    logger.info('Order placed successfully:', response.data);
    res.json({ success: true, orderResponse: response.data });
  } catch (error) {
    error = error.response?.data || error.message || 'Unknown error';
    logger.error('Error placing order:', error);
    res.status(500).send("Lỗi đặt lệnh\n\n" + JSON.stringify(error));
  }
}
