export const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size limit exceeded. Maximum allowed size is 100MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // Custom validation or standard errors
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
