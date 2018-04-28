From xuntian/node-yarn as builder
MAINTAINER xuntian "li.zq@foxmail.com"
COPY ./ /code/
WORKDIR /code
# RUN npm --registry https://registry.npm.taobao.org install
# RUN npm --registry https://registry.npm.taobao.org update
# RUN npm run build
# ARG BUILD_ENV
RUN npm install
# RUN NODE_ENV=${BUILD_ENV} TZ=Asia/Shanghai yarn build
# RUN npm run dev
CMD npm run dev
