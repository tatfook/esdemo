import axios from "axios";

import {Err} from "../error.js";

export function httpRequest(method, url, data, config) {
	method = (method || "get").toLowerCase();
	config = {...(config || {}), method:method, url:url};
	if (method == "get" || method == "delete" || method == "head" || method == "options") {
		config.params = data;
	} else {
		config.data = data;
	}

	return axios.request(config).then(res => new Err(res.data.code, res.data.message, res.data.data)).catch((e => console.log(e)));
}

export const httpGet = (url, data, config) => httpRequest("get", url, data, config);
export const httpPost = (url, data, config) => httpRequest("post", url, data, config);
export const httpPut = (url, data, config) => httpRequest("put", url, data, config);
export const httpDelete = (url, data, config) => httpRequest("delete", url, data, config);


function initHttpOptions(self, options) {
	options = options || {};
	options.headers = options.headers || {};
	
	self.options = options;
	self.httpGet = httpGet;
	self.httpPost = httpPost;
	self.httpPut = httpPut;
	self.httpDelete = httpDelete;
}

export function User(options) {
	const self = this;

	initHttpOptions(self, options);

	const apiRequest = (method, url) => (data, config) => httpRequest(method || "get", url, data, Object.assign(self.options, config));


	self.login = apiRequest("post", "user/login");
	self.register = apiRequest("post", "user/register");
	self.isLogin = apiRequest("get", "user/isLogin");
}

export function DataSource(options) {
	const self = this;

	initHttpOptions(self, options);

	const apiRequest = (method, url) => (data, config) => httpRequest(method || "get", url, data, Object.assign(self.options, config));
	
	self.getDefaultDataSource = apiRequest("get", "dataSource/getDefaultDataSource");
	self.getByUsername =  apiRequest("get", "dataSource/getByUsername");
	self.upsert = apiRequest("post", "dataSource/upsert");
	self.delete = apiRequest("delete", "dataSource/delete");
}

export const mod = {

}

export function Note(options){
	const self = this;
	initHttpOptions(self, options);


	self.user = new User(self.options);
	self.dataSource = new DataSource(self.options);
}

export default new Note();
