/**
 * 기본 CRUD API 기능 구현
 * 실제 서비스에선 비공개 or 삭제할 예정.
 *
 */
var express = require('express');
var router = express.Router();

const pg = require('pg'); // PostgreSQL 의 모듈을 로딩.
const sql_info = require('../common/sql_info'); // SQL 인증정보를 외부 모듈로 분리 2019.05.12
const isAuthenticated = require('../common/is_auth'); // 세션 정보를 파악하여 로그인 되었는지 판단하는 미들웨어 2019.05.12

/**
 * 쿼리문 정의
 *
 */

const sql_insert_query = 'INSERT INTO taco.test_table VALUES ($1, $2, $3);';
const sql_read_query = 'SELECT * FROM taco.test_table where true';
const sql_read_latest_query = 'select id from taco.test_table where true order by id desc limit 1';
const sql_delete_query = 'DELETE FROM taco.test_table where id=$1';
const sql_update_query = 'UPDATE taco.test_table SET title=$2, content=$3 WHERE id=$1';


/**
 * Write POST 요청 핸들링
 * DB 접속, 쿼리 처리 장애 시 비동기 오류처리.
 * 오류시에는 다른 오류처리 핸들링 코드로 보냄
 */

router.post('/write', isAuthenticated, function(req, res, next) {
    let val = [
        req.body.id,
        req.body.title,
        req.body.memo
    ];
    let client = new pg.Client(sql_info);
    client.connect(err => {
        if(err) {
            console.log(req.app.get('env') === 'development' ? err : {});
            next(new Error('db_conn_err')); // DB 접속에러
        }
    });
    client
        .query(sql_insert_query, val)
        .then( () => {
            res.json('{Status : ok}');
        })
        .catch(err => {
            console.log(req.app.get('env') === 'development' ? err : {});
            next(new Error('db_write_err')); // DB 쿼리실행 에러
        })
        .then(() => {
            client.end();
        });
});


/**
 * 페이지 정보 없을 때, 가장 최신글의 ID 반환하여 리다이렉트 함.
 * DB 접속, 쿼리 처리 장애 시 비동기 오류처리.
 */

router.get('/list', isAuthenticated, function (req, res, next) {
    let client = new pg.Client(sql_info);
    client.connect(err => {
        if(err) {
            console.log(req.app.get('env') === 'development' ? err : {});
            next(new Error('db_conn_err')); // DB 접속에러
        }
    });
    client
        .query(sql_read_latest_query)
        .then( res_sql => {
            res.redirect('./list/' + res_sql.rows[0].id);
        })
        .catch(err => {
            console.log(req.app.get('env') === 'development' ? err : {});
            next(new Error('db_write_err')); // DB 쿼리실행 에러
        })
        .then(() => {
            client.end();
        });
});



router.get('/list/:id', isAuthenticated, function(req, res, next) {
    let client = new pg.Client(sql_info);
    let id = req.params.id; // request 받은 id값
    client.connect(err => {
        if(err) {
            console.log('에러');
            console.log(req.app.get('env') === 'development' ? err : {});
        }
    });
    client
        .query(sql_read_query)
        .then(res_sql => {
            let rows = res_sql.rows;
            console.log('query 실행 완료');
            res.json(res_sql.rows);
            rows.map(row => {
                console.log(`Read: ${JSON.stringify(row)}`);
            });
            client.end(console.log('연결 종료'));
        })
        .catch(err => console.log(err))
        .then(() => {
            client.end(console.log("끝"));
        });
});


/**
 * 게시물 삭제
 * DB 접속, 쿼리 처리 장애 시 비동기 오류처리.
 * 오류시에는 다른 오류처리 핸들링 코드로 보냄
 */

router.get('/del/:id', isAuthenticated, function(req, res, next) {
    let id = req.params.id; // request 받은 id값
    let val = [
        id
    ];
    let client = new pg.Client(sql_info);
    client.connect(err => {
        if(err) {
            console.log(req.app.get('env') === 'development' ? err : {});
            next(new Error('db_conn_err')); // DB 접속에러
        }
    });
    client
        .query(sql_delete_query, val)
        .then( sql_res => {
            if(sql_res.rowCount) {
                res.json('{Status : ok}');
            } else {
                res.json('{Status : fail}');
            }
        })
        .catch(err => {
            console.log(req.app.get('env') === 'development' ? err : {});
            next(new Error('db_write_err')); // DB 쿼리실행 에러
        })
        .then(() => {
            client.end();
        });
});


/**
 * 게시물 변경 (update)
 * DB 접속, 쿼리 처리 장애 시 비동기 오류처리.
 * 오류시에는 다른 오류처리 핸들링 코드로 보냄
 */

router.post('/mod/:id', isAuthenticated, function(req, res, next) {
    let id = req.params.id; // request 받은 id값
    let val = [
        id,
        req.body.title,
        req.body.memo
    ];
    let client = new pg.Client(sql_info);
    client.connect(err => {
        if(err) {
            console.log(req.app.get('env') === 'development' ? err : {});
            next(new Error('db_conn_err')); // DB 접속에러
        }
    });
    client
        .query(sql_update_query, val)
        .then( () => {
            res.json('{Status : ok}');
        })
        .catch(err => {
            console.log(req.app.get('env') === 'development' ? err : {});
            next(new Error('db_write_err')); // DB 쿼리실행 에러
        })
        .then(() => {
            client.end();
        });
});

module.exports = router;
