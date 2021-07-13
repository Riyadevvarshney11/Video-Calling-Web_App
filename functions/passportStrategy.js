//Passport to authenticate a request
const localStrategy =require("passport-local").Strategy;
const passportAuthenticator = (passport, user) =>{
  passport.use(
    new localStrategy({usernameField:"username", passwordField: "passoword"},async(username,password,done) =>{
      await user.findOne({ username: username }, (err, data) => {
        if (err) return done(err);
        if(data) {
          //verify callback invokes that are done to supply PassPort with the user that authenticated.
          if((data,password==password)) done(null,data);
          //When User enters wrong password or username
          else return done(null, false, { message: "Password Incorrect" });
        } else return done(null, false, { message: "Username Not found" });
      });
    }
    )
  );

//The serialization and deserialization logic allowins the application to choose an
// appropriate database and/or object mapper, without imposition by the authentication layer.
  passport.serializeUser((data, done) => {
    return done(null, data.id);
  });
  passport.deserializeUser(async(id, done) => {
    
    await user.findById(id, (err, data) => {
      return done(null, data);
    });
  });
};

module.exports = passportAuthenticator;


