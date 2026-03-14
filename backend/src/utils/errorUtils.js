export function isGatewayOrHtmlError(message) {
  if (!message || typeof message !== 'string') return false;
  return (
    message.includes('<!DOCTYPE') ||
    message.includes('502') ||
    message.includes('Bad gateway') ||
    message.includes('503')
  );
}

export function normalizeError(err) {
  const msg = err?.message ?? String(err);
  if (isGatewayOrHtmlError(msg)) {
    return {
      status: 503,
      message: 'Database tạm thời không khả dụng (502). Vui lòng thử lại sau.',
    };
  }
  return { status: 500, message: msg };
}
