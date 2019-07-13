const Koa = require('koa')
const Router = require('koa-router')
const jwt = require('jwt-simple')
const crypto = require('crypto');
const koaBody = require('koa-body')
const base64url = require('base64url');
const url = require('url');
var TextEncoder = require('text-encoder-lite').TextEncoderLite;
const koaJwt = require('koa-jwt') //路由权限控制
const sendEmail = require('./email');
const app = new Koa()
const  router = new Router()

//秘钥
const jwtSecret = 'jwtSecret'
const tokenExpiresTime = 1000 * 60 * 60 * 24 * 7

function convertStringToArrayBufferView(str){
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        bytes[iii] = str.charCodeAt(i);
    }

    return bytes;
}

function HexStr2Bytes(str){
    var pos = 0;
    var len = str.length
    if(len %2 != 0){
       return null; 
    }
    len /= 2;
    var hexA = new Array();
    for(var i=0; i<len; i++){
       var s = str.substr(pos, 2);
       var v = parseInt(s, 16);
       hexA.push(v);
       pos += 2;
    }
    return new Uint8Array(hexA);
}

function authenticateEmail(email, clientRandomValue) {
    var b64encoder = base64url.encode(clientRandomValue.toString())
    // 创建一个邮件对象
    var mail = {
        from: 'mochunyi <1935358563@qq.com>',
        subject: '激活邮箱账号',
        to: `${email}`,
        html: `
            <p>还不上车，老表</p>
            <a href='http://localhost:3000/checkemail#${b64encoder}'>http://localhost:3000/checkemail#${b64encoder}</a>
        `
    };
    sendEmail(mail);
}

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function(ctx, next){
    ctx.res.setHeader('Access-Control-Allow-Origin', '*')
    ctx.res.setHeader('Access-Control-Allow-Methods', 'POST');
    ctx.res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Content-Type-Options');
    ctx.res.setHeader('Content-Type', 'application/json')
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = 'Protected resource, use Authorization header to get access\n';
        } else {
            throw err;
        }
    });
});




global.users = [];

function adduser(userinfo) {
    if (!checkuser(userinfo.email)) {
        global.users.push(userinfo)
        console.log('添加成功');
    }
}

function checkuser(email) {
    var users = global.users;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) return true;
    }
    return false;
}

function sha256(inputbytes, length) {
    const hash = crypto.createHash('sha256');
    hash.update(inputbytes);
    var hexStr = hash.digest('hex');
    var outbytes = HexStr2Bytes(hexStr).subarray(0, length)
    return outbytes;
}

router.post('/register', koaBody(), async (ctx) => {
    var data = ctx.request.body;
    var email = data.email;
    var username = data.username;
    var clientRandomValue = new Uint8Array(Object.values(data.clientRandomValue));
    var encryptMasterKey = new Uint8Array(Object.values(data.encryptMasterKey));
    var hashedAuthenticationKey = new Uint8Array(Object.values(data.hashedAuthenticationKey));
    adduser({email, username, clientRandomValue, encryptMasterKey, hashedAuthenticationKey, authenticateEmail: false});
    authenticateEmail(email, clientRandomValue);
    ctx.body = {
        code: 200,
    }
})

router.post('/login', koaBody(), async ctx => {
    var email = ctx.request.body.email;
    var resbody = {
        code: -1,
    }
    for (let i = 0; i < global.users.length; i++) {
        if (global.users[i].email === email && global.users[i].authenticateEmail) {
            resbody.code = 200;
            var currentuser = global.users[i];
            var clientRandomValue = currentuser.clientRandomValue
            var saltString = 'mochunyi';
            var saltStringMaxLength = 200;
            var saltHashInputLength = saltStringMaxLength + clientRandomValue.length;  // 216 bytes
            for (let i = saltString.length; i < saltStringMaxLength; i++) {
                saltString += 'P';
            }
            var saltStringBytes = new TextEncoder('utf-8').encode(saltString);
            var saltInputBytesConcatenated = new Uint8Array(saltHashInputLength);
            saltInputBytesConcatenated.set(saltStringBytes);
            saltInputBytesConcatenated.set(clientRandomValue, saltStringMaxLength);

            var saltBytes = sha256(saltInputBytesConcatenated, 16)
            resbody.salt = saltBytes;
        }
    }
    ctx.body = resbody;
})

router.post('/checkemail', koaBody(), async ctx => {
    var confirm = ctx.request.body.confirm;
    var resbody = {
        code: -1,
    }
    for (let i = 0; i < global.users.length; i++) {
        var clientRandomValue = global.users[i].clientRandomValue;
        var b64decoder = base64url.decode(confirm)
        if (b64decoder === clientRandomValue.toString()) {
            global.users[i].authenticateEmail = true;
            resbody.code = 200;
        }
    }
    ctx.body = resbody;
})

router.post('/authentication', koaBody(), async ctx => {
    var authenticationKey = new Uint8Array(Object.values(ctx.request.body.derivedAuthenticationKeyBytes))
    var hashedAuthenticationKey = sha256(authenticationKey, 32)
    var resbody = {
        code: -1,
    }
    for (let i = 0; i < global.users.length; i++) {
        if (global.users[i].hashedAuthenticationKey.toString() === hashedAuthenticationKey.toString()) {
            resbody.code = 200;
            
            resbody.encryptMasterKey = global.users[i].encryptMasterKey;
        }
    }
    ctx.body = resbody;
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3001, () => {
    console.log('app listening 3001...')
})