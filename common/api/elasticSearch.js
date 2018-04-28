
import elasticsearch from "elasticsearch";

const defaultConfig = {
	host: "http://10.28.18.7:9200",
}

export const ElasticsearchFactory = function(config){
	this.api = new elasticsearch.Client({
		...defaultConfig,
		...(config || {}),
	});
}

ElasticsearchFactory.prototype.search = function(key, query) {
	return this.api.search({
		index: key.index(),
		type: key.type(),
		body: query,
	}).then(data => ({total: data.hits.total, list: data.hits.hits.map(val => ({...val._source, id:val._id}))}));	
}

export default new ElasticsearchFactory();
