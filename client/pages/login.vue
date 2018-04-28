<template>
	<div class="container" style="margin-top:40px">
		<el-row>
			<el-col :span="8" :offset="8">
				<el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-width="80px">
					<el-form-item label="用户名:" prop="username">
						<el-input v-model="loginForm.username"></el-input>
					</el-form-item>
					<el-form-item label="密码:" prop="password">
						<el-input type="password" v-model="loginForm.password" @keyup.native.enter="submitLoginForm"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button @click.prevent="submitLoginForm">登陆</el-button>
					</el-form-item>
				</el-form>
			</el-col>
		</el-row>
	</div>
</template>

<script>
import {
	Row,
	Col,
	Form,
	FormItem,
	Input,
	Button,
	Message,
} from "element-ui";
import {mapActions, mapGetters} from "vuex";
import gitlab from "@@/common/api/gitlab.js";
import config from "@/config.js";
import keepwork from "@@/common/api/keepwork.js";

keepwork.options.baseURL = config.keepwork.baseURL;

export default {
	components: {
		[Button.name]: Button,
		[Row.name]: Row,
		[Col.name]: Col,
		[Form.name]: Form,
		[FormItem.name]: FormItem,
		[Input.name]: Input,
	},

	data:function(){
		return {
			loginForm:{
				username:"",
				password:"",
			},
			loginRules: {
				username: [
				{required:true, message:"用户名不能为空", trigger:"blur"}
				],
				password: [
				{required:true, message:"密码不能为空", trigger:"blur"}
				]
			}
		}
	},
	props:{
	},
	methods: {
		...mapActions({
			setToken:"user/setToken",
			setUser: "user/setUser",
			setUserDataSource: "user/setUserDataSource",
			setDataSource: "dataSource/setDataSource",
		}),
		async loginSuccess(token, userinfo) {
			const self = this;
			self.setToken(token);
			self.setUser(userinfo);

			self.$router.push({name:"index"});
		},
		submitLoginForm() {
			const self = this;
			this.$refs.loginForm.validate(function(valid){
				if (!valid) {
					return;
				}
				
				keepwork.user.login({
					username:self.loginForm.username,
					password:self.loginForm.password,
				}).then(function(data){
					if (data.error.id != 0) {
						Message(data.error.message);
						return;
					}
					data = data.data;
					self.loginSuccess(data.token, data.userinfo);
				})
			});
		}
	},
}
</script>
