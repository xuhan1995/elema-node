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
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("X-Powered-By", '3.2.1')
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
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
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