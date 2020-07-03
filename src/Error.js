const RuleError = module.exports = class RuleError extends Error {
  constructor(message, status = 400) {
    super(message); // (1)
    this.status = status;
  }
}
