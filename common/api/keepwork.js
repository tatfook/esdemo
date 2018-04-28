import axios from "axios";
import * as qiniu from "qiniu-js";

export function httpRequest(method, url, data, config) {
	method = (method || "get").toLowerCase();
	config = {...(config || {}), method:method, url:url};
	if (method == "get" || method == "delete" || method == "head" || method == "options") {
		config.params = data;
	} else {
		config.data = data;
	}

	return axios.request(config).then(res => res.data).catch((e => console.log(e)));
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

export function SiteDataSource(options) {
	const self = this;
	initHttpOptions(self, options);

	const apiRequest = (method, url) => (data, config) => httpRequest(method || "get", url, data, Object.assign(self.options, config));

	self.get = apiRequest("get", "site_data_source/getSiteDataSource");
}

export function Site(options) {
	const self = this;
	initHttpOptions(self, options);

	const apiRequest = (method, url) => (data, config) => httpRequest(method || "get", url, data, Object.assign(self.options, config));

	self.getByName = apiRequest("get", "website/getByName");
	self.create = apiRequest("post", "website/createSite");
}

export function Qiniu(options) {
	const self = this;
	initHttpOptions(self, options);

	const apiRequest = (method, url) => (data, config) => httpRequest(method || "get", url, data, Object.assign(self.options, config));
	
	const proxyBaseURL = options.proxyBaseURL || "";

	self.getQiniuOptions = async () => {
		let data = null;
		if (!self.uid) {
			data = await self.httpGet(proxyBaseURL + "qiniu/getUid");
			if (!data || !data.data) {
				return ;
			}
			self.uid = data.data.uid;
		}
		if (!self.token) {
			data = await self.httpGet(proxyBaseURL + "qiniu/getUploadToken");
			if (!data || !data.data) {
				return ;
			}
			self.token = data.data.token;
		}

		return {
			token: self.token,
			putExtra: {
				params: {
					"x:uid": self.uid,
				},
				mimeType: null,
			},
			config: {
				useCdnDomain: true,
			},
		}
	}

	self.upload = async (file, key, observer) => {
		const opts = await self.getQiniuOptions();
		if (!opts || !file) {
			if (observer && observer.error) {
				observer.error();
			}
		}
		
		key = key || file.name;

		const observable = qiniu.upload(file, key, opts.token, opts.putExtra, opts.config);
		observable.subscribe(observer || {
			next(res) {
				console.log(res);
			},
			error(err) {
				console.log(err);
			},
			complete(res){
				console.log(res);
			}
		});
	},

	// params: {key:string, expires:number}
	self.getDownloadUrl = apiRequest("get", "qiniu/getDownloadUrl");
}

export function Keepwork(options){
	const self = this;
	initHttpOptions(self, options);

	self.user = new User(self.options);
	self.siteDataSource = new SiteDataSource(self.options);
	self.site = new Site(self.options);
	self.qiniu = new Qiniu(self.options);
}

export default new Keepwork();
