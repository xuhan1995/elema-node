import express from 'express'
import config from 'config-lite'
import db from './mongodb/db'
import router from './routes/index'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import connectMongo from 'connect-mongo'
import history from 'connect-history-api-fallback'
import chalk from 'chalk'

const app = express()

//set res.header
app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*")  //允许的域设置全部，解决跨域
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With") //允许的header
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("X-Powered-By", '3.2.1')
	res.header("Cache-Control", 'no-store')   //解决304，实际上这种资源应该只请求一次，这样这句就是多余的
	if (req.method == 'OPTIONS') {
	  	res.sendStatus(200);
	} else {
	    next();
	}
})

app.use(cookieParser())
//set session by connect-mongo
const MongoStore = connectMongo(session)
app.use(session({
	name: config.session.name,
	secret: config.session.secret,
	cookie: config.session.cookie,
	resave: true,   // 是否每次都重新保存会话
	saveUninitialized: false,
	store: new MongoStore({  // session持久化保存到mongoDB
		url: config.url
	})
}))

router(app)

//fix refresh can't get history 
app.use(history())
app.use(express.static('./public'))
app.listen(config.port,() =>{
	console.log(
		chalk.green(`成功监听端口：${config.port}`)
	)
})