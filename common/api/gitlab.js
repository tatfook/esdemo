//import gitlabApi from "../../client/lib/gitlab-api";
//import gitlabApi from "@/lib/gitlab-api";
import gitlabApi from "node-gitlab-api";
import {Base64} from "js-base64";
import yaml from "js-yaml";
import _ from "lodash";


const defaultUsername = "keepwork";

const defaultConfig = {
	apiBaseUrl:"https://gitlab.com",
	rawBaseUrl:"https://gitlab.com",
	token:"Ed9S7hSfiruewMR-jitR",
	ref:"master",
	branch:"master",
	projectId:4980659,
	//rootPath:"xiaoyao",
};

const gitlab = {
	gits:{

	}
}

const encodeUrl = function(url) {
	return encodeURIComponent(url).replace(/\./g,'%2E')
}

const getUsernameByPath = function(path) {
	const paths = (path || "").split("/");
	let username = "keepwork";
	for (let i = 0; i < paths.length; i++) {
		if (paths[i]) {
			username = paths[i];
			break;
		}
	}

	username = username.replace(/_(data|files)$/, "");

	return username;
}

export function Gitlab(config){
	config = _.mapKeys(config || {}, (value, key) => _.camelCase(key));
	this.cfg = {
		...defaultConfig,
		...((gitlab.gits[config.username] || {}).cfg || {}),
		...(config || {}),
	};
	
	const gitcfg = {url: this.cfg.rawBaseUrl, token: this.cfg.token};
	this.api = new gitlabApi({url:this.cfg.rawBaseUrl, token:this.cfg.token});
}

Gitlab.prototype.getFile = function(path) {
	return this.api.RepositoryFiles.show(this.cfg.projectId, path, this.cfg.ref).then(file => {
		file.content = Base64.decode(file.content);
		return file;
	});
}

Gitlab.prototype.getContent = function(path) {
	return this.api.RepositoryFiles.show(this.cfg.projectId, path, this.cfg.ref).then(file => Base64.decode(file.content));
}

Gitlab.prototype.upsertFile = async function(path, options) {
	options = {...(options || {}), commit_message:"create or update"};
	const file = await this.getFile(path).catch(() => {});
	return file ? this.editFile(path, options) : this.createFile(path, options);
}

Gitlab.prototype.editFile = function(path, options) {
	options = {...(options || {}), commit_message:"update"};
	return this.api.RepositoryFiles.edit(this.cfg.projectId, path, this.cfg.branch, options);
}

Gitlab.prototype.createFile = function(path, options) {
	options = {...(options || {}), commit_message:"create"};
	return this.api.RepositoryFiles.create(this.cfg.projectId, path, this.cfg.branch, options);
}

Gitlab.prototype.deleteFile = function(path, options) {
	options = {...(options || {}), commit_message:"delete"};
	return this.api.RepositoryFiles.remove(this.cfg.projectId, path, this.cfg.branch, options);
}

Gitlab.prototype.getTree = function(path, options) {
	options = options || {};
	options.path = path;

	return this.api.Repositories.tree(this.cfg.projectId, options);
}

Gitlab.prototype.getFileGitUrl = function(path) {
	const url = this.cfg.rawBaseUrl + "/" + this.cfg.externalUsername + "/" + this.cfg.projectName + '/blob/' + "master" + '/' + path;
	
	return url;
}

Gitlab.prototype.upsertHook = async function(url, options) {
	const hooks = await this.api.ProjectHooks.all(this.cfg.projectId, options);
	const index = hooks.findIndex(hook => hook.url === url);
	return index >= 0 ? hooks[index] : this.api.ProjectHooks.add(this.cfg.projectId, url, options);
}

Gitlab.prototype.wrapTableData = function(key, data) {
	return yaml.safeDump({
		key: _.omitBy(key, _.isFunction),
		data: data || {},
	});
}

Gitlab.prototype.upsertTableData = function(key, data, options) {
	return this.upsertFile(key.path(), {...(options || {}), content: this.wrapTableData(key, data)});
}

Gitlab.prototype.deleteTableData = function(key) {
	return this.deleteFile(key.path());
}

Gitlab.prototype.searchTableData = function(key, query) {
	return ;
}

Gitlab.prototype.upsertProject = async function(projectName) {
	const nullFunc = () => {};
	const self = this;
	const projects = await self.api.Projects.all({owned: true, search:projectName}).catch(() => {});
	if (!projects) return ;

	if (projects.length > 0) return projects[0];

	const project = await self.api.Projects.create({name:projectName}).catch(nullFunc);

	return project;
}

gitlab.initConfig = function(config){
	if (!config || !config.username) {
		return;
	}
	
	this.gits[config.username] = new Gitlab(config);
}

gitlab.getGitByPath = function(path) {
	const username = getUsernameByPath(path);
	return this.gits[username] || this.gits[defaultUsername];
}

gitlab.getContent = function(path) {
	return this.getGitByPath(path).getContent(path);
}

gitlab.getFile = function(path) {
	return this.getGitByPath(path).getFile(path);
}

gitlab.editFile = function(path, options) {
	const git = this.getGitByPath(path);
	return git.editFile(path, options);
}

gitlab.createFile = function(path, options) {
	const git = this.getGitByPath(path);
	//path = encodeUrl(path);
	return git.createFile(path, options);
}

gitlab.deleteFile = function(path, options) {
	const git = this.getGitByPath(path);
	return git.deleteFile(path, options);
}

gitlab.getTree = function(path, options) {
	const git = this.getGitByPath(path);
	return git.getTree(path, options);
}

gitlab.getFileGitUrl = function(path) {
	return this.getGitByPath(path).getFileGitUrl(path);
}

export const gitlabFactory = (config) => new Gitlab(config);

export default gitlab;
