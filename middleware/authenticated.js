const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null)
        return res.status(401).send({error: 'Not Authorized' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err instanceof jwt.TokenExpiredError)
            return res.status(401).send({error: 'Unauthorized! Access Token was expired!' });
        
        if (err instanceof jwt.JsonWebTokenError)
            return res.status(401).send({error: 'Unauthorized! Invalid Token!' });
        
        if (err)
            return res.status(401).send({error: 'Not Authenticated'})
        
        req.userID = user.uuid;
        req.email = user.email;
        req.username = user.username;
        req.token = token;
    
        next()
    })
}

module.exports = authenticateToken