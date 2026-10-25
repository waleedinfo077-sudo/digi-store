/* Digi Store settings. Replace the example values with your own before launch. */
window.DIGI_STORE_CONFIG = {
  STORE_NAME: "Digi Store",
  CURRENCY: "PKR",
  CURRENCY_SYMBOL: "Rs",
  FORM_PROVIDER: "web3forms", // Choose "web3forms", "formspree", or "none".
  FORM_ACCESS_KEY: "", // Paste the access key from Web3Forms, or your Formspree form ID.
  OWNER_EMAIL: "", // Email address for order notifications. Web3Forms uses this in your account settings.
  OWNER_WHATSAPP: "", // WhatsApp number with country code and digits only, e.g. 923001234567.
  PAYMENT_METHODS: {
    bank: "", // Optional bank transfer instructions shown after an order.
    jazzcash: "", // Optional JazzCash account instructions.
    easypaisa: "" // Optional Easypaisa account instructions.
  },
  DELIVERY_TIME_TEXT: "2 to 5 business days, confirmed after we discuss your project.",
  SUPPORT_TEXT: "We’ll contact you using the details you provide.",
  SOCIAL_LINKS: { instagram: "", facebook: "", linkedin: "" }, // Add full social profile URLs if available.
  FEATURES: { darkMode: true, whatsapp: true, telegram: false } // Feature switches for optional integrations.
};
