# pingd
Pingd is a looking glass server made to be lightweight.

## Installation (Docker)
```shell script
# Download the example config
wget https://raw.githubusercontent.com/BrightSkyz/pingd/master/.env.example -O /home/example/.pingd-env
# Note: Be sure to edit this configuration to match your needs

# Start the Docker container with the enviroment file mounted
docker run -v /home/example/.pingd-env:/opt/pingd/.env -d --restart always --network host --name pingd brightskyz/pingd:latest

# Optional: Auto-update the container when a new build is published
docker run -v /var/run/docker.sock:/var/run/docker.sock -d --restart always --name pingd-watchtower containrrr/watchtower pingd --interval 60
```

## Installation (Manual)
Prerequisites:
- Node 12 (and npm)
- git
- mtr
- ping
- traceroute
```shell script
# Switch to the /opt directory
cd /opt

# Clone the repository
git clone https://github.com/BrightSkyz/pingd.git pingd

# Switch to the directory
cd pingd

# Copy the example config
cp .env.example .env
# Note: Be sure to edit this configuration to match your needs

# Install the dependencies
npm install

# Compile the TypeScript
npm run build

# Start the application
source .env && node dist/index.js
```