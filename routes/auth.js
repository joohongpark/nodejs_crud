/**
 * auth.js
 * 인증 관련 처리 API 정의.
 *
 */
let express = require('express');
let router = express.Router();

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

const sql_info = require('../common/sql_info'); // SQL 인증정보를 외부 모듈로 분리 2019.05.12
const isAuthenticated = require('../common/is_auth'); // 세션 정보를 파악하여 로그인 되었는지 판단하는 미들웨어 2019.05.12


passport.use( new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        if((username === 'user001' || username === 'user002') && password === 'password'){
            // 해당 루틴에 DB 연동하여 로그인 정보 확인, 지역정보 ID 뽑아주는 루틴 있어야 함.
            return done(null, {
                'user_id': username,
                'area': 'Suwon',
            });
        } else {
            return done(false, null);
        }
    }
));
passport.serializeUser(function (user, done) {
    console.log('serialize');
    console.log(user);
    done(null, user)
});
passport.deserializeUser(function (user, done) {
    console.log('deserialize');
    console.log(user);
    done(null, user);
});
router.get('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(new Error('auth_err'));
        }
        if (!user) {
            return res.send({ success : false, message : 'authentication failed' });
        }
        req.login(user, loginErr => {
            if (loginErr) {
                return next(new Error('login_err'));
            }
            return res.send({ success : true, message : 'authentication succeeded' });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res){
    req.logout();
    res.send({ success : true, message : 'logout succeeded' });
});

router.get('/test', isAuthenticated, function (req, res, next) {
    res.render('index', { title: req.user.user_id });
});

module.exports = router;
