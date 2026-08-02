import "dotenv/config";

const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "";
const mock =
  process.env.RAZORPAY_MOCK === "true" ||
  process.env.RAZORPAY_MOCK === "1" ||
  keyId === "rzp_test_mock";

export const razorpayConfig = {
  keyId: mock ? keyId || "rzp_test_mock" : keyId,
  keySecret: mock ? keySecret || "mock_secret" : keySecret,
  webhookSecret,
  mock,
  currency: "INR",
  companyName: process.env.RAZORPAY_COMPANY_NAME?.trim() || "Shri Ahilyamata Gaushala",
  get enabled() {
    return this.mock || Boolean(this.keyId && this.keySecret);
  },
};
