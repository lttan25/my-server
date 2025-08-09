# Đặt tên image
$imageName = "my-trading-app"
$containerName = "trading-app-container"

# Build Docker image
Write-Host "Building Docker image..."
docker build -t $imageName .

# Kiểm tra và dừng container cũ nếu đang chạy
$running = docker ps -q -f name=$containerName
if ($running) {
    Write-Host "Stopping existing container..."
    docker stop $containerName
    docker rm $containerName
}

# Chạy container mới
Write-Host "Starting new container..."
docker run -d `
    --name $containerName `
    -p 3000:3000 `
    -v ${PWD}/data:/usr/src/app/data `
    -v ${PWD}/logs:/usr/src/app/logs `
    -v ${PWD}/certificates:/usr/src/app/certificates `
    $imageName

Write-Host "Container started successfully!"
Write-Host "You can check logs with: docker logs $containerName"
