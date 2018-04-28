
import {mapActions, mapGetters} from "vuex";

import config from "@/config.js";
import {Gitlab} from "@@/common/api/gitlab.js";
import {Keepwork} from "@@/common/api/keepwork.js";

export default {
	data: function() {
		return {
			keepwork: new Keepwork({
				baseURL: config.keepwork.baseURL,
				proxyBaseURL: config.QiniuService.baseURL,
			}),
			sitename: "demo",
		};
	},

	computed: {
		...mapGetters({
			token: "user/token",
			user: "user/user",
			isAuthenticated: "user/isAuthenticated",
		}),
	},

	methods: {
		async loadData() {
			if (!this.token || !this.user || !this.user.username) {
				this.$router.push("/login");
				return ;
			}

			this.keepwork.options.headers['Authorization'] = "Bearer " + this.token;

			const siteParams = {
				username: this.user.username,
				sitename: this.sitename,
			};

			let data = await this.keepwork.site.getByName(siteParams);
			let siteinfo = null;

			// keepwork网站不存在 则创建网站
			if (!data || !data.data) {
				data = await this.keepwork.site.create(siteParams);
				siteinfo = data.siteinfo;
			} else {
				siteinfo = data.data;
			}

			// 获取网站数据源
			data = await this.keepwork.siteDataSource.get(siteParams);
			if (!data || !data.data) {
				console.log("-----------------server inner error-----------------");
				return
			}

			// 初始化git api 
			const gitcfg = data.data;
			this.git = new Gitlab({
				apiBaseUrl: gitcfg.rawBaseUrl,
				rawBaseUrl: gitcfg.rawBaseUrl,
				projectId: gitcfg.projectId,
				projectName: gitcfg.projectName,
				externalUsername: gitcfg.dataSourceUsername,
				token: gitcfg.dataSourceToken,
				username: gitcfg.username,
				sitename: gitcfg.sitename,
			});

			// 注册钩子
			this.git.upsertHook(config.ESService.baseURL + "gitlab/webhook");
		}
	}
}
