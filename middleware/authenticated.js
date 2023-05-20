import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null)
        return res.status(401).json({message: 'Not Authorized' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err instanceof jwt.TokenExpiredError)
            return res.status(401).json({message: 'Unauthorized! Access Token was expired!' });
        
        if (err instanceof jwt.JsonWebTokenError)
            return res.status(401).json({message: 'Unauthorized! Invalid Token!' });
        
        if (err)
            return res.status(401).json({message: 'Not Authenticated'})
        
        req.userID = user.uuid;
        req.email = user.email;
        req.username = user.username;
        req.token = token;
    
        next()
    })
}

export default authenticateToken;