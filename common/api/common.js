const uuidv1 = require('uuid/v1');

const splitChar = ".";

export function getKeyByPath(path) {
	const reg = /^__data__\/([^\/]+)\/(.+)\.yaml$/;
	const paths = path.match(reg);

	if (!paths) return;

	const index = paths[1];
	const id = paths[2];
	
	const indexes = index.split(splitChar);

	if (indexes.length != 3) {
		return;
	}
	const prefix = indexes[0] && indexes[0];
	const tablename = indexes[1] && indexes[1];
	const version = indexes[2] && indexes[2];
	
	return new Key({prefix, version, tablename, id});
}

export function Key(opt = {}) {
	const self = this;
	const table = new Table({prefix:self.prefix, version:self.version, tablename:self.tablename});
	
	self.prefix = opt.prefix || "kw";
	self.version = opt.version || "v0";
	self.tablename = opt.tablename || "tablename";
	self.id = opt.id || "__id__";
		
	self.getTable = () => table;

	self.path = (id) => "__data__/" +  table.index() + "/" + (id || self.id) + ".yaml";
	self.uid = (id) => self.path(id).replace(/\//g, "_").replace(/\.yaml/, "");
}

Key.prototype.parsePath = function(path) {
	return getKeyByPath(path);
}

// 定义一个表
export function Table(opt = {}) {
	const  self = this;
	
	self.prefix = opt.prefix || "kw";
	self.version = opt.version || "v0";
	self.tablename = opt.tablename || "tablename";

	self.getKey = (id) => {
		id = id || uuidv1();
		return new Key({prefix:self.prefix, version:self.version, tablename:self.tablename, id:id});
	}

	self.type = () => self.tablename;
	self.index = () => [self.prefix, self.type(), self.version].join(splitChar);
}

export default {
	Table: Table,
	Key: Key,
	getKeyByPath: getKeyByPath,
};
