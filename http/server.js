'use strict'

const http = require('http')
const createHafas = require('hafas-client')
const dbProfile = require('hafas-client/p/db')
const createServerAdapter = require('../lib/server-adapter')

const port = process.env.PORT || 3000;
const hafas = createHafas(dbProfile, 'my-awesome-program')
const onMessage = createServerAdapter(hafas)

http.createServer((req, res) => {
	if (req.method !== 'POST') {
		res.statusCode = 404
		return res.end()
	}
	
	let postData = ''
	req.on('data', (data) => {
		postData += data
	})
	req.on('end', () => {
		onMessage(postData, (data) => {
			res.end(data + '')
		})
	})
}).listen(port, () => {
	console.log('webserver listening on port ' + port)
})
