exports.handler = (event, _context, callback) => {
  const params = event.path.split("#")[1];

  const response = {
    statusCode: 301,
    headers: {
      Location: `https://auth.expo.io/@fiberjw/goodweebs?${params}`,
    },
  };

  return callback(null, response);
};
