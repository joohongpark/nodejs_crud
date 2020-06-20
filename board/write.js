/**
 * 실제 게시글 작성 미들웨어
 *
 */
var express = require('express');
var router = express.Router();

const pg = require('pg/lib'); // PostgreSQL 의 모듈을 로딩.
const sql_info = require('../common/sql_info'); // SQL 인증정보를 외부 모듈로 분리 2019.05.12
const isAuthenticated = require('../common/is_auth'); // 세션 정보를 파악하여 로그인 되었는지 판단하는 미들웨어 2019.05.12

/**
 * 쿼리문 정의
 *
 */

// 게시물 작성 쿼리
const sql_article_insert_query =
    'WITH test AS ' +
        '( INSERT INTO taco.posts ' +
            '(user_id, timestamp, title, main_text, comment_cnt, tag_1, tag_2, tag_3) ' +
            'VALUES ' +
            '($1, now(), $2, $3, $4, $5, $6, $7) ' +
            'RETURNING id) ' +
    'INSERT INTO taco.category_list (category_id, article_id) VALUES (1, (SELECT id FROM test));';

// 게시물 작성 이전 카테고리에 존재하는가 확인하는 쿼리문
const sql_is_exists_query = ' SELECT COUNT(*) FROM taco.category WHERE category_id = $1;';

/**
 * 게시글 작성
 * DB 접속, 쿼리 처리 장애 시 비동기 오류처리.
 * 오류시에는 다른 오류처리 핸들링 코드로 보냄
 */

router.post('/write_article', isAuthenticated, function(req, res, next) {
    let category = req.body.category;
    let val = [
        req.body.user_id,
        req.body.title,
        req.body.main_text,
        0,
        (req.body.tag_1 === undefined) ? 0 : req.body.tag_1,
        (req.body.tag_2 === undefined) ? 0 : req.body.tag_2,
        (req.body.tag_3 === undefined) ? 0 : req.body.tag_3
    ];
    if(category === undefined) {
        return next(new Error('write_category_err'));
    }
    let client = new pg.Client(sql_info);
    client.connect(err => {
        if(err) {
            console.log(req.app.get('env') === 'development' ? err : {});
            client.end();
            return next(new Error('db_conn_err')); // DB 접속에러
        }
    });
    client.query(sql_is_exists_query, [category], (err, q_res) => {
        if(err) {
            client.end();
            return next(new Error('write_category_db_err'));
        } else {
            if(q_res.rows[0].count === 0) {
                client.end();
                return next(new Error('write_category_db_range_err'));
            }
        }
    });
    client.query(sql_article_insert_query, val, (err, q_res) => {
        if(err) {
            client.end();
            console.log(req.app.get('env') === 'development' ? err : {});
            return next(new Error('db_write_err')); // DB 쿼리실행 에러
        } else {
            client.end();
            res.json('{Status : ok}');
        }
    });
});

module.exports = router;