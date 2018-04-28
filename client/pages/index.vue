<template>
	<div class="container">
		<div>
			<el-button @click="clickNewBtn">新增</el-button>
		</div>
		<el-table :data="datas">
			<el-table-column fixed prop="name" label="名称"></el-table-column>
			<el-table-column fixed prop="description" label="描述"></el-table-column>
			<el-table-column fixed prop="logoUrl" label="LOGO"></el-table-column>
			<el-table-column fixed="right" label="操作">
				<template slot-scope="{row, $index}">
					<el-button @click="clickDeleteBtn(row, $index)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
import {
	Button,
	Table,
	TableColumn,
} from "element-ui";

import {mapActions, mapGetters} from "vuex";

import config from "@/config.js";
import {ElasticsearchFactory} from "@@/common/api/elasticSearch.js";
import common from "@@/common/api/common.js";
import keepwork from "@/components/keepwork.js";

const elasticsearch = new ElasticsearchFactory({
	host: config.elasticsearch.baseURL,
});

export default {
	mixins: [keepwork],
	components: {
		[Button.name]: Button,
		[Table.name]: Table,
		[TableColumn.name]: TableColumn,
	},

	data: function() {
		return {
			table: new common.Table({
				tablename: "tablename",    // 表名      必选
				version: "v0",        // 版本 可选
				prefix: "kw",         // 前缀限定 可选
			}),
			datas: [],
		}
	},

	computed: {
		...mapGetters({
			token: "user/token",
		}),
	},

	methods: {
		clickNewBtn() {
			this.$router.push({name: "new"});
		},
		clickDeleteBtn(m, index) {
			this.datas.splice(index, 1);
			if (this.git) {
				this.git.deleteTableData(this.table.getKey(m.name || m.id))
			}
		},
	},

	async mounted() {
		await this.loadData();
		const demo = await elasticsearch.search(this.table);
		this.datas = demo.list;
		console.log(this.datas);
	},
}

</script>
