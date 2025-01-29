# Build stage
FROM node


# Set the working directory inside the container  
WORKDIR /app  

# Copy package.json and package-lock.json to the container  
COPY package*.json ./  

# Install dependencies  
RUN npm install  

# Copy the app source code to the container  
COPY . .  

# Build the Next.js app  
RUN npm run build  

# Expose the port the app will run on  
EXPOSE 3001

# Start the app with specific port  
CMD ["npm", "run", "start", "--", "-p", "3001"]  