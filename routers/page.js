const {Router} = require('express');
const {delPage, getCustomPage, getPage, postPage} = require('../controllers/page');
const pageRoutes = Router()

pageRoutes.get('/', getPage)
pageRoutes.post('/', postPage)
pageRoutes.delete('/', delPage)
pageRoutes.get('/custom-page', getCustomPage)

module.exports = pageRoutes
