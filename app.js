/**
 * express app 모듈 (MiddleWare)
 *
 * morgan - 요청 로그
 */

let logger        = require('morgan');
let createError   = require('http-errors');
let express       = require('express');
let path          = require('path');
let cookieParser  = require('cookie-parser');
let helmet        = require('helmet'); // 2019.05.01
let compression   = require('compression'); // 2019.05.01
let bodyParser    = require('body-parser'); // 2019.05.08
let favicon       = require('serve-favicon'); // 2019.05.12 필수는 아니지만 파비콘 요청 플랫폼 대응
let passport      = require('passport'); // 2019.05.12
let cookieSession = require('cookie-session'); // 2019.05.12
var flash         = require('connect-flash'); // 2019.05.12



/**
 * 라우팅 응답 (엔드포인트에 대한 핸들러) 정의
 *
 * crud : 게시글 조회 삭제 등등 REST API
 * auth : 인증 등 관련 API
 * write : 글 작성 API
 */
let index_Router = require('./routes/index');
let crud_Router = require('./routes/crud');
let auth_Router = require('./routes/auth');
let write_Router = require('./board/write');
let list_Router = require('./board/list');

/**
 * cookie session 설정
 *
 */
const cookie_settings = {
    secret: 'taco',
    keys: ['taco'],
    cookie: {
        _expires: 1000 * 60 * 60 * 24 // 유효기간 24시간
    }
};

/**
 * express engine 사용을 위한 변수 정의.
 *
 */
let app = express();

/**
* view engine setup - directory, pug setting
*
*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/**
 * 모듈들 사용 정의
 * 1. 로거
 * 2. json
 * 3. url encode
 * 4. cookie parser
 * 5. ???
 *
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet()); // helmet 적용 2019.05.01
app.use(compression()); // compression 적용 2019.05.01
app.use(bodyParser.json()); // request post body parser 2019.05.08
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico'))); // favicon 적용 2019.05.12
app.use(cookieSession(cookie_settings)); // 2019.05.12
app.use(passport.initialize()); // 2019.05.12
app.use(passport.session()); // 2019.05.12
app.use(flash()); // 2019.05.12


/**
 * 라우팅 정의
 *
 */
app.use('/', index_Router);
app.use('/t', crud_Router);
app.use('/auth',auth_Router);
app.use('/do', write_Router);
app.use('/do', list_Router);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log("err");
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // 에러 메세지 렌더링 - error.pug
    console.log(err.message);
    res.locals.message = "404 - 잘못된 접근입니다.";
    res.locals.error = {};
    console.log(req.app.get('env') === 'development' ? err : {});

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;