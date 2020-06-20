/**
 * 게시판 View 미들웨어
 *
 */
var express = require('express');
var router = express.Router();

const pg = require('pg'); // PostgreSQL 의 모듈을 로딩.
const sql_info = require('../common/sql_info'); // SQL 인증정보를 외부 모듈로 분리 2019.05.12
const isAuthenticated = require('../common/is_auth'); // 세션 정보를 파악하여 로그인 되었는지 판단하는 미들웨어 2019.05.12

/**
 * 쿼리문 정의
 * 나중에 수정해야함.
 */

const sql_read_query =
    'WITH CAT AS ' +
    '(SELECT article_id FROM taco.category_list WHERE category_id = $1 ORDER BY id DESC LIMIT $2) ' +
    'SELECT taco.posts.* FROM CAT, taco.posts WHERE CAST(CAT.article_id AS INTEGER)=taco.posts.id;';
const sql_read_query_with_range =
    'WITH CAT AS ' +
    '(SELECT article_id FROM taco.category_list WHERE category_id = $1  AND article_id < $3 ORDER BY id DESC LIMIT $2) ' +
    'SELECT taco.posts.* FROM CAT, taco.posts WHERE CAST(CAT.article_id AS INTEGER)=taco.posts.id;';

router.get('/list/:board/:count/:id', isAuthenticated, function(req, res, next) {
    let board = req.params.board;
    let count = req.params.count;
    let id = parseInt(req.params.id);
    let val = [
        board,
        count
    ];
    let val_id = [
        board,
        count,
        id
    ];

    let client = new pg.Client(sql_info);
    client.connect(err => {
        if(err) {
            console.log('에러 발생');
            console.log(req.app.get('env') === 'development' ? err : {});
        }
    });
    client.query((id === 0) ? sql_read_query : sql_read_query_with_range, (id === 0) ? val : val_id, (err, q_res) => {
        if(err) {
            client.end();
            console.log(req.app.get('env') === 'development' ? err : {});
            return next(new Error('db_write_err')); // DB 쿼리실행 에러
        } else {
            let rows = q_res.rows;
            console.log('query 실행 완료');
            res.json(q_res.rows);
            rows.map(row => {
                console.log(`Read: ${JSON.stringify(row)}`);
            });
            client.end(console.log('연결 종료'));
        }
    });
});

module.exports = router;