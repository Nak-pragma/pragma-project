// utils/formatter.js
export function formatResponse(provider, content) {
  return {
    provider,
    content,
    timestamp: new Date().toISOString(),
  };
}

export function handleError(res, err, provider) {
  console.error(`❌ ${provider} Error:`, err.message);
  res.status(500).json({
    provider,
    error: err.message,
    timestamp: new Date().toISOString(),
  });
}
