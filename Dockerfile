# Use a Node.js image as base
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure the node_modules folder exists and has the correct permissions
RUN mkdir -p /usr/src/app/node_modules && chown -R node:node /usr/src/app

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app in development mode
CMD ["npm", "run", "dev"]
