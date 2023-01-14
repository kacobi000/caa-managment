const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  console.log("kurwa")
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'MmcXUQpSl3KxyAw');
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;
  console.log(req.headers['Authorization'])
  next();

};
