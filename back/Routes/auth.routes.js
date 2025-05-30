const {verifySignUp} = require('../middelwares');
const controller = require('../controllers/auth.controller');


app.get('/check', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ 
      loggedIn: true, 
      user: {
        id: req.user.id,
        nombre: req.user.displayName || req.user.name,
        email: req.user.emails ? req.user.emails[0].value : req.user.email,
        foto: req.user.photos ? req.user.photos[0].value : null
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/');
  });

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});


module.exports = (app)=>{
    app.use((req,res,next)=>{
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post('/api/auth/signup',
        [
            verifySignUp.checkDuplicateEmail,
            verifySignUp.checkRolesExisted
        ],
        controller.signup
    );

    app.post('/api/auth/signin', controller.signin);

    app.get('/api/auth/signout', controller.signout);
}