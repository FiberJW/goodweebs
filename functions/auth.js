exports.handler = (event, context, callback) => {
  const params = event.path.split("#")[1];

  console.log({ event, context });

  const response = {
    statusCode: 301,
    headers: {
      Location: `https://auth.expo.io/@fiberjw/goodweebs?${params}`,
    },
  };

  return callback(null, response);
};
