'use strict'

import BaseComponent from '../../prototype/baseComponent'
import addressModel from '../../models/v1/address'
import formidable from 'formidable'

class Address extends BaseComponent {
  constructor(){
    super()
    this.addAddress = this.addAddress.bind(this)
  }

  async addAddress (req, res) {
    const user_id = req.session.user_id || req.params.user_id
    try {
      if (!user_id || isNaN(user_id)) {
        throw new Error('user_id参数错误')
      }
    } catch (error) {
      console.error('user_id参数错误', error)
      res.status(400).send({
				type: 'ERROR_USER_ID',
				message: 'user_id参数错误',
      })
      return
    }

    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files) => {
      const {address, address_detail, geohash, name, phone, phone_bk, poi_type = 0, sex, tag, tag_type} = fields
      try{
				if (!user_id || !Number(user_id)) {
					throw new Error('用户ID参数错误')
				}else if(!address){
					throw new Error('地址信息错误')
				}else if(!address_detail){
					throw new Error('详细地址信息错误')
				}else if(!geohash){
					throw new Error('geohash参数错误')
				}else if(!name){
					throw new Error('收货人姓名错误')
				}else if(!phone){
					throw new Error('收获手机号错误')
				}else if(!sex){
					throw new Error('性别错误')
				}else if(!tag){
					throw new Error('标签错误')
				}else if(!tag_type){
					throw new Error('标签类型错误')
				}
			}catch(err){
				console.error(err);
				res.status(400).send({
					status: 0,
					type: 'GET_WRONG_PARAM',
					message: err.message
				})
				return
      }
      
      try {
        const address_id = await this.getId('address_id')
        const newAddress = {
					id: address_id,
					address,
					phone,
					phone_bk: phone_bk&&phone_bk,
					name,
					st_geohash: geohash,
					address_detail,
					sex,
					tag,
					tag_type,
					user_id,
        }
        await addressModel.create(newAddress)
        res.send({
					status: 1,
					success: '添加地址成功'
				})
      } catch (error) {
        console.error('添加地址失败', error);
				res.status(500).send({
					status: 0,
					type: 'ERROR_ADD_ADDRESS',
					message: '添加地址失败'
				})
      }
    })

  }

  async getAddress (req, res) {
    const user_id = req.session.user_id || req.params.user_id
    try {
      if (!user_id || isNaN(user_id)) {
        throw new Error('user_id参数错误')
      }
    } catch (error) {
      console.error('user_id参数错误', error)
      res.status(400).send({
				type: 'ERROR_USER_ID',
				message: 'user_id参数错误',
      })
      return
    }

    try {
      const userAddress =  await addressModel.findOne({ user_id })
      res.send(userAddress)
    } catch (error) {
      console.error('获取用户地址数据失败',error);
			res.status(500).send({
				status: 0,
				type: 'ERROR_GET_DATA',
				message: '获取用户地址数据失败'
			})
    }
  }

  async deleteAddress (req, res) {
    const user_id = req.session.user_id || req.params.user_id
    const address_id = req.params.address_id
    try {
      if (!user_id || isNaN(user_id) || !address_id || isNaN(address_id)) {
        throw new Error('参数错误')
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({
          type: 'ERROR_PARAMS',
          message: '参数错误',
      })
    }
    
    try {
      const address = await addressModel.findOneAndRemove({ id: address_id })
      if (address) {
        res.send({
          status: 1,
          success: '删除地址成功',
        })
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error(error)
      res.status(500).send({
				type: 'ERROR_DELETE_ADDRESS',
				message: '删除收获地址失败'
			})
    }
  }

}

export default new Address()