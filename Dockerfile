FROM node:24

# Set environment (nếu cần)
ENV NODE_ENV=production

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Copy và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Lệnh chạy app
CMD ["npm", "start"]
