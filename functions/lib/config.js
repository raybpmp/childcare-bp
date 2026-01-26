"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
exports.CONFIG = {
    // In production, these should be environment variables. 
    // For now, using provided values as requested.
    postmarkToken: process.env.POSTMARK_KEY || '57242712-82f9-4c43-b918-25287f04f82b',
    fromAddress: 'hello@childcarebusinessplan.com',
    internalRecipient: 'hello@childcarebusinessplan.com'
};
//# sourceMappingURL=config.js.map