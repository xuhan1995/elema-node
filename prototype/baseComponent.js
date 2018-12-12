'use strict'

import fetch from 'node-fetch'
import formidable from 'formidable'
import idsModel from '../models/ids'
import path from 'path'
import fs from 'fs'
import gm from 'gm'
import crypto from 'crypto'

export default class BaseComponent {
  constructor(){
    this.idList = ['restaurant_id', 'food_id', 'order_id', 'user_id', 'address_id', 'cart_id', 'img_id', 'category_id', 'item_id', 'sku_id', 'admin_id', 'statis_id']
    this.acceptFormat = ['.jpg', '.jpeg', '.png']
    this.uploadImg = this.uploadImg.bind(this)
  }

  async uploadImg (req, res) {
    try {
      const image_path = await this.getPath(req, res)
      res.send({
        status: 0,
        image_path,
        message: '上传图片成功'
      })
    } catch (error) {
      console.error(error)
      res.status(500).send({
				status: 0,
				type: 'ERROR_UPLOAD_IMG',
				message: '上传图片失败'
			})
    }
  }

  async getPath (req, res) {
    return new Promise ((resolve, reject) => {
      const form = formidable.IncomingForm()
      form.uploadDir = './public/img/'
      form.maxFieldsSize = 1 * 1024 * 1024
      form.parse(req, async (err, fields, file) => {
        let img_id
        try {
          img_id = await this.getId('img_id')
        } catch (error) {
          console.error('获取图片id失败')
					fs.unlinkSync(file.file.path)
          reject('获取图片id失败')
          return
        }
        const hashName = (new Date().getTime() + Math.ceil( Math.random() * 10000 )).toString(16) + img_id
        const extname = path.extname(file.file.name)
        if (!this.acceptFormat.includes(extname)) {
          fs.unlinkSync(file.file.path)
          res.send({
            status: 0,
						type: 'ERROR_EXTNAME',
						message: '文件格式错误'
          })
          reject('上传失败')
          return
        }
        const fullName = hashName + extname
        const repath = form.uploadDir + fullName
        try {
          fs.renameSync(file.file.path, repath)
          gm(repath).resize(200, 200, '!').write(repath, err => {
            resolve(fullName)
          })
        } catch (error) {
          console.error('保存图片失败')
					if (fs.existsSync(repath)) {
						fs.unlinkSync(repath)
					} else {
						fs.unlinkSync(file.file.path)
					}
					reject('保存图片失败')
        }
      })
    })
  }

  async getId (type) {
    try {
      if (!this.idList.includes(type)) {
        throw new Error('id类型错误')
      }
    } catch (error) {
        console.error(error)
    }
    try {
      const id = await idsModel.findOne()
      id[type] ++
      await id.save()
      return id[type]
    } catch (error) {
      console.error('获取id失败', error);
    }
  }

  encryption (password) {
		const newpassword = this.Md5(this.Md5(password).substr(2, 7) + this.Md5(password))
		return newpassword
  }

  Md5 (password) {
    const md5 = crypto.createHash('md5')
		return md5.update(password).digest('base64')
  }

  async fetch(url = '', data = {}, type = 'GET', resType = 'JSON'){
    type = type.toUpperCase()
    resType = resType.toUpperCase()
    if (type === 'GET') {
      let queryString = ''
      Object.keys(data).forEach(key => {
        queryString += key + '=' + data[key] + '&'
      })
      if (queryString) {
        queryString = queryString.substr(0, queryString.lastIndexOf('&'))
        url += '?' + queryString
      }
    }

    let requestConfig = {
			method: type,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
    }
    
    if (type === 'POST') {
      requestConfig.body = JSON.stringify(data)
    }

    let responseConent
    
    try {
      const response = await fetch(url, requestConfig)
      if (resType === 'TEXT') {
        responseConent = await response.text()
      }else{
        responseConent = await response.json()        
      }
    } catch (error) {
      console.log('获取http数据失败', error);
    }
    return responseConent
  }
  
}

