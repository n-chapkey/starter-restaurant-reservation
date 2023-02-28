function hasProperties(...properties) {
    return function (res, req, next) {
      const { data = {} } = res.body;
      try {
        properties.forEach((property) => {
          const value = data[property];
          if (!value) {
            const error = new Error(`A '${property}' property is required.`);
            error.status = 400;
            throw error;
          }
        });
        //console.log("************",res.locals);
        return next();
      } catch (error) {
        return next(error);
      }
    };
  }
  
  module.exports = hasProperties;