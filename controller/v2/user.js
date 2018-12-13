'use strict'

import AddressComponent from '../../prototype/addressComponent'
import formidable from 'formidable'
import userModel from '../../models/v2/user'
import userInfoModel from '../../models/v2/userInfo'
import timeFormater from 'time-formater'

class User extends AddressComponent {
  constructor(){
    super()
    this.login = this.login.bind(this)
    this.register = this.register.bind(this)
    this.changePassword = this.changePassword.bind(this)
  }

  async register (req, res) {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, file) => {
      const { username, password } = fields
      try {
        if (!username) {
          throw new Error('用户名参数错误')
        }
        if (!password) {
          throw new Error('密码参数错误')
        }
      } catch (error) {
        console.error(error)
        res.status(400).send({
          status: 0,
					type: 'ERROR_QUERY',
					message: error.message,
        })
        return
      }

      const newPassword = this.encryption(password)
      try {
        const user = await userModel.findOne({username})
        if (user) {
          res.status(400).send({
            status: 0,
						type: 'ERROR_USERNAME',
						message: '用户名已存在',
          })
          return
        } else {
          const user_id = await this.getId('user_id') //报错了id也会+1，需要优化
          const cityInfo = await this.getPosition(req)
          const registe_time = timeFormater().format('YYYY-MM-DD HH:mm')
          const newUser = { username , password : newPassword, user_id }
          const newUserInfo = {username, user_id, id: user_id, city: cityInfo.city, registe_time }
          // 分别保存应该是两个并行的异步
          const parallel = userModel.create(newUser)
          const tmp = userInfoModel.create(newUserInfo)
          await parallel
          const createUserInfo = await tmp
          res.send(createUserInfo)
        }
      } catch (error) {
          console.error(error)
          res.status(500).send({
            status: 0,
            type: 'REGISTER_FAILED',
            message: '注册失败',
          })
      }
    })
  }

  async login (req, res) {
    const cap = req.cookies.cap
    try {
      if (!cap) {
        throw new Error('验证码失效')
      }
    } catch (error) {
      console.error(error)
			res.status(400).send({
				status: 0,
				type: 'ERROR_CAPTCHA',
				message: '验证码失效',
			})
			return
    }

    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, file) => {
      const {username, password, captcha_code} = fields
      try {
        if (!username) {
          throw new Error('用户名参数错误')
        }
        if (!password) {
          throw new Error('密码参数错误')
        }
        if (!captcha_code || cap !== captcha_code) {
          throw new Error('验证码参数错误')
        }
      } catch (error) {
        console.error(error)
        res.status(400).send({
          status: 0,
					type: 'ERROR_QUERY',
					message: error.message,
        })
        return
      }

      const newPassword = this.encryption(password)
      try {
        const user = await userModel.findOne({ username })
        if (!user) {
          res.status(400).send({
            status: 0,
						type: 'ERROR_USERNAME',
						message: '用户名不存在',
          })
          return
        } else if (user.password.toString() !== newPassword.toString()) {
          console.error('用户登录密码错误')
					res.status(400).send({
						status: 0,
						type: 'ERROR_PASSWORD',
						message: '密码错误',
					})
					return 
        } else {
          req.session.user_id = user.user_id
          const userInfo = await userInfoModel.findOne({ user_id : user.user_id }, '-_id')
          res.send(userInfo)
        }
      } catch (error) {
        console.log('用户登陆失败', error);
				res.status(500).send({
					status: 0,
					type: 'SAVE_USER_FAILED',
					message: '登陆失败',
				})
      }
    })

  }

  async getUserInfo (req, res) { //用session实现了状态持久化
    const sid = req.session.user_id
    const qid = req.query.user_id
    const user_id = sid || qid
    try {
      if (!user_id || isNaN(user_id)) {
        throw new Error('获取用户ID失败')
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({
				status: 0,
				type: 'GET_USER_INFO_FAIELD',
				message: '通过session获取用户信息失败',
			})
			return 
    }

    try {
      const userInfo = await userInfoModel.findOne({ user_id }, '-_id')
      res.send(userInfo)
    } catch (error) {
      console.error('获取用户信息失败')
      res.status(500).send({
        status: 0,
				type: 'GET_USER_INFO_FAIELD',
				message: '获取用户信息失败',
      })
    }
  }

  signOut (req, res) {
    delete req.session.user_id
    res.send({
      status: 1,
			message: '退出成功'
    })
  }

  async changePassword (req, res) {
    const cap = req.cookies.cap
    try {
      if (!cap) {
        throw new Error('验证码失效')
      }
    } catch (error) {
      console.error(error)
			res.status(400).send({
				status: 0,
				type: 'ERROR_CAPTCHA',
				message: '验证码失效',
			})
			return
    }

    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, file) => {
      const { username, oldpassword, newpassword, captcha_code } = fields
      try{
				if (!username) {
					throw new Error('用户名参数错误')
				}else if(!oldpassword){
					throw new Error('必须添加旧密码')
				}else if(!newpassword){
					throw new Error('必须填写新密码')
				}else if(!captcha_code || captcha_code !== cap){
					throw new Error('验证码参数错误');
				}
			}catch(err){
				console.log('修改密码参数错误', err);
				res.status(400).send({
					status: 0,
					type: 'ERROR_QUERY',
					message: err.message,
				})
				return
      }
      
      try {
        const user = await userModel.findOne({ username })
        const md5OldPassword = this.encryption(oldpassword)
        if (!user) {
          res.status(500).send({
            status: 0,
						type: 'USER_NOT_FOUND',
						message: '未找到当前用户',
          })
          return
        }
        if (md5OldPassword !== user.password) {
          res.status(500).send({
            status: 0,
						type: 'ERROR_PASSWORD',
						message: '密码不正确',
          })
          return
        }
        user.password = this.encryption(newpassword)
        await user.save()
        res.send({
          status: 1,
          success: '密码修改成功',
        })
      } catch (error) {
        console.log('修改密码失败', error)
				res.status(500).send({
					status: 0,
					type: 'ERROR_CHANGE_PASSWORD',
					message: '修改密码失败',
				})
      }
    })
  }

}

export default new User