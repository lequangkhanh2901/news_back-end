const CryptoJS = require('crypto-js')
const {
  titlePost,
  listIdCategory,
  listIdWriter,
  listIdCensor,
  listSortDescription,
  avartarLink,
  contentPost,
} = require('../fakeData/post')
const LikePostModel = require('../model/likePostModel')
const Post = require('../model/postModel')

const getPosts = async (req, res) => {
  try {
    let { page } = req.params
    const postsPerPage = 20

    if (!page || page < 1) {
      page = 1
    }
    const [response, [numPost]] = await Promise.all([
      Post.list(page, postsPerPage),
      Post.getNumPost(),
    ])
    return res.json({
      code: 200,
      message: 'ok',
      data: {
        posts: response,
        numPages: Math.ceil(numPost.numrows / postsPerPage),
      },
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
const getPost = async (req, res) => {
  const { id } = req.params
  const authorization = req.headers.authorization
  let idUser = undefined
  // let response = null
  try {
    if (authorization) {
      const user = JSON.parse(
        CryptoJS.AES.decrypt(authorization, process.env.PRIVATE_KEY).toString(
          CryptoJS.enc.Utf8
        )
      )
      idUser = user.id
    }
    if (idUser) {
      // response = Post.get(id)
      const [postContent, num_like, isLikeByUser] = await Promise.all([
        Post.get(id),
        LikePostModel.getNum(id),
        LikePostModel.isLikeByUser(idUser, id),
      ])
      postContent.num_like = num_like
      postContent.viewed = postContent.viewed + 1
      delete postContent.id_censor
      delete postContent.censored_at
      delete postContent.deleted
      postContent.avartar_cdn =
        process.env.APP_CDN_URL + postContent.avartar_cdn
      postContent.isLikeByUser = isLikeByUser.length == 1
      Post.updateViewed(id, postContent.viewed)
      return res.json({
        code: 200,
        message: 'ok',
        data: postContent,
      })
    } else {
      const [postContent, num_like] = await Promise.all([
        Post.get(id),
        LikePostModel.getNum(id),
      ])
      postContent.num_like = num_like
      postContent.viewed = postContent.viewed + 1
      delete postContent.id_censor
      delete postContent.censored_at
      delete postContent.deleted
      postContent.avartar_cdn =
        process.env.APP_CDN_URL + postContent.avartar_cdn
      Post.updateViewed(id, postContent.viewed)
      return res.json({
        code: 200,
        message: 'ok',
        data: postContent,
      })
    }

    //LikePostModel.getNum(id)
    return

    if (response == 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    if (response.length == 0) {
      return res.json({
        code: 404,
        message: 'not found',
      })
    }
    const [data] = response
    data.viewed = data.viewed + 1
    delete data.id_censor
    delete data.censored_at
    delete data.deleted
    data.avartar_cdn = process.env.APP_CDN_URL + data.avartar_cdn
    Post.updateViewed(id, data.viewed)
    return res.json({
      code: 200,
      data: data,
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
const getSearch = async (req, res) => {
  const { searchData } = req.params
  try {
    if (searchData.trim() == '') {
      return res.json({
        code: 203,
        message: 'missing param',
      })
    }
    const searchArr = searchData.trim().split(' ')
    const response = await Post.search(searchArr)
    if (response == 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    return res.json({
      code: 200,
      messgae: 'ok',
      data: response,
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
const getNew = async (req, res) => {
  try {
    let num = 5
    const response = await Post.new(num)
    if (response == 'fail') {
      return res.json({
        code: 500,
        message: 'errorC',
      })
    }
    response.forEach((element) => {
      element.avartar_cdn = process.env.APP_CDN_URL + element.avartar_cdn
    })
    return res.json({
      code: 200,
      message: 'ok',
      data: response,
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'errorC',
    })
  }
}
const add = async (req, res) => {
  try {
    return res.json({
      code: 201,
      message: 'ok',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
const hanleUploadAvartar = async (req, res) => {
  try {
    const response = await Post.add({
      ...req.body,
      avartar_cdn: '/images/avartarPost/' + req.file.filename,
      id_author: 1 /* get key from token*/,
    })
    return res.json({
      code: 201,
      message: 'ok',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
const getPostOfcategory = async (req, res) => {
  try {
    const postsPerPage = 20
    const { id } = req.params
    let page = req.params.page
    if (!id) {
      return res.json({
        code: 404,
        message: 'missing params',
      })
    }
    if (!page) {
      page = 1
    }
    const [response, [numrows]] = await Promise.all([
      Post.postOfCategory(id, page, postsPerPage),
      Post.getNumPostOfCategory(id),
    ])
    if (response === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    response.forEach((item) => {
      item.avartar_cdn = process.env.APP_CDN_URL + item.avartar_cdn
    })
    return res.json({
      code: 200,
      message: 'ok',
      data: {
        posts: response,
        numpages: Math.ceil(numrows.numrows / postsPerPage),
      },
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const generatepost = (req, res) => {
  try {
    const listTitleLen = titlePost.length
    const listIdCategoryLen = listIdCategory.length
    const listIdWriterLen = listIdWriter.length
    const listCensorLen = listIdCensor.length
    const listSortDesLen = listSortDescription.length

    for (let i = 0; i < 100; i++) {
      let time = Date.now()
      let randomCreate = Math.floor(Math.random() * 1000000 + 1000000)
      let randomCensor = Math.floor(Math.random() * 999999)
      let indexListTitle = Math.floor(Math.random() * listTitleLen)
      let indexListCategory = Math.floor(Math.random() * listIdCategoryLen)
      let indexListWriter = Math.floor(Math.random() * listIdWriterLen)
      let indexListCensor = Math.floor(Math.random() * listCensorLen)
      let indexListDesc = Math.floor(Math.random() * listSortDesLen)

      let createTime = time - randomCreate
      let censorTime = time - randomCensor
      Post.generateFakePostData({
        title: titlePost[indexListTitle],
        id_category: listIdCategory[indexListCategory],
        sort_description: listSortDescription[indexListDesc],
        avartar_cdn: avartarLink,
        content: contentPost,
        id_author: listIdWriter[indexListWriter],
        id_censor: listIdCensor[indexListCensor],
        viewed: 0,
        deleted: 0,
        created_at: createTime,
        censored_at: censorTime,
      })
    }
  } catch (error) {}
  return res.send('hi')
}
const deletePost = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) {
      return res.json({
        code: 400,
        message: 'missing params',
      })
    }

    const response = await Post.delete(id)
    if (response === 'fail') {
      return res.json({ code: 50, message: 'error' })
    }
    return res.json({
      code: 203,
      message: 'deleted',
    })
  } catch (error) {
    return res.json({ code: 50, message: 'error' })
  }
}

const likePost = async (req, res) => {
  try {
    const id = req.body.id
    if (!id) {
      return res.json({
        code: 400,
        message: 'missin params',
      })
    }

    const user = JSON.parse(
      CryptoJS.AES.decrypt(
        req.headers.authorization,
        process.env.PRIVATE_KEY
      ).toString(CryptoJS.enc.Utf8)
    )

    const response = await LikePostModel.isLikeByUser(user.id, id)
    if (response.length === 0) {
      const resLike = await LikePostModel.like(user.id, id)
      if (resLike !== 'fail') {
        return res.json({
          code: 201,
          message: 'liked',
        })
      }
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    const resUnlike = await LikePostModel.unLike(response[0].idLike)
    if (resUnlike !== 'fail') {
      return res.json({
        code: 202,
        message: 'unliked',
      })
    }
    return res.json({
      code: 500,
      message: 'error',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

module.exports = {
  getPosts,
  getPost,
  getSearch,
  getNew,
  add,
  hanleUploadAvartar,
  getPostOfcategory,
  generatepost,
  deletePost,
  likePost,
}
/////// data to generate post
