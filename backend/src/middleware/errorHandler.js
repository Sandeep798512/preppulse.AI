const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`❌ [${req.method}] ${req.url} Error:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
