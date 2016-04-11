var express = require('express');
var router = express.Router();

var crypto = require('crypto'),
    User   = require('../models/user'),
    Post   = require('../models/post');

/* GET home page. */
router.get('/', function(req, res, next) {

    /////
    Post.get(null, function(err, posts) {
        if (err) {
            posts=[];
        }

        res.render('index', { 
            title: '首页',
            user:  req.session.user,
            posts: posts,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
         });
    });
});


router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next){
	res.render('reg', { title: '用户注册' });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res){
	var username = req.body.username,
		password = req.body.password,
        password_re = req.body['password-repeat']; 

    //chech two passwords
    if (password != password_re) {

    	req.flash('error', '两次输入的密码不一致');
    	console.log('两次输入的密码不一致......');
      	return res.redirect('/reg'); // back to registration page
    }

    // generate password's MD5
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: username,
      password: password
    });

    // check if name is already exist
    User.get(newUser.name, function(err, user) {
      if (err){
        req.flash('error', err);
        return res.redirect('/');
      }

      if(user){
        req.flash('error', '用户已存在');
        req.flash('success', null);
        return res.redirect('/reg');
      }

      newUser.save(function (err, user){
        if (err){
          req.flash('error', err);
          return res.redirect('/reg');
        }

        req.session.user = user;// save user info to session
        req.flash('success', '注册成功, 已登录。');
        res.redirect('back');// back to home
      });
    });

});


router.get('/login', function(req, res) {
	res.render('login', { 
		title: '用户登录',
	    user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString() 
    });
});

router.post('/login', function(req, res){
	
	// get md5 passord
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');

    User.get(req.body.username, function(err, user){
    	if (err) {
    		req.flash('error', err);
        	return res.redirect('/login');
    	}

    	if (!user) {
    		req.flash("error", '用户不存在');
    		return res.redirect('/login');
    	}

    	if (user.password != password) {
    		req.flash("error", '密码不正确');
    		return res.redirect('/login');
    	}

    	req.session.user = user;
    	req.flash("success", '登录成功');
        res.redirect('/');

    });
});

router.get('/logout', function(req, res){
	req.session.user = null;
	req.flash("success", '退出成功');
    res.redirect('/');

});


router.post('/post', checkLogin);
router.post('/post', function(req, res) {
    var currentUser = req.session.user;
    if (!req.body.post) {
        req.flash('error','微博为空');
        res.redirect('/u/'+ currentUser.name);

    } else {
        var post = new Post(currentUser.name, req.body.post);
        post.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success','发表成功');
            res.redirect('/');
        });
    }
});
 

router.get('/u/:user', function(req, res){
	 User.get(req.params.user, function(err, user) {

        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }
        Post.get(user.name, function(err, posts) {
            if (err) {
                req.flash('err', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                user: user,
                posts: posts
            });
        });
     });
});






function checkLogin(req, res, next){
    if (!req.session.user){
        req.flash('error', '未登录');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next){
    if(req.session.user){
        req.flash('success', '已登录');
        res.redirect('/');
    }
    next();
}



module.exports = router;
