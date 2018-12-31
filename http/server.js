#!/usr/bin/env node

'use strict'

const http = require('http')
const url = require('url')
const createHafas = require('hafas-client')
const createServerAdapter = require('../lib/server-adapter')

const port = process.env.PORT || 3000
const profiles = ['bvg', 'cmta', 'db', 'insa', 'nahsh', 'oebb', 'sbahn-muenchen', 'vbb']
const onMessageFor = {}

for (let p of profiles) {
	const profile = require('hafas-client/p/' + p)
	const hafas = createHafas(profile, 'my-awesome-program')
	const hafas2 = {...hafas, journeys: (...args) => {
		return hafas.journeys.apply(hafas, args)
		.then((res) => {
			return {
				journeys: res,
				earlierRef: res.earlierRef,
				laterRef: res.laterRef
			}
		})
	}}
	onMessageFor[p] = createServerAdapter(hafas2)
}

http.createServer((req, res) => {
	if (req.method !== 'POST') {
		res.statusCode = 404
		return res.end()
	}

	const p = url.parse(req.url).pathname.substring(1)
	if (!onMessageFor[p]) {
		res.statusCode = 404
		return res.end()
	}

	let postData = ''
	req.on('data', (data) => {
		postData += data
	})
	req.on('end', () => {
		onMessageFor[p](postData, (data) => {
			res.end(data + '')
		})
	})
}).listen(port, () => {
	console.log('webserver listening on port ' + port)
})
