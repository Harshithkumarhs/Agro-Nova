# Grocery Management System

A web-based grocery management system that connects consumers, farmers, and logistics providers. The system facilitates grocery ordering, delivery management, and communication between different stakeholders using modern web technologies.

## Features

- **Multi-Role System**:
  - Consumer: Can order groceries and manage their shopping lists
  - Farmer: Can manage inventory and fulfill orders
  - Logistics: Handles delivery and transportation

- **Real-time Communication**: Integrated with Twilio for notifications and updates
- **Secure Authentication**: Password hashing using bcrypt
- **Database Management**: MongoDB integration for data persistence

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: EJS
- **Authentication**: bcrypt for password hashing
- **Notifications**: Twilio API
- **Other Dependencies**:
  - body-parser
  - mongoose
  - express
  - ejs

## Prerequisites

- Node.js (v12 or higher)
- MongoDB (running locally or accessible instance)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up MongoDB:
   - Ensure MongoDB is running on localhost:27017
   - Database name: groceryDB

## Environment Setup

Make sure to configure the following:
- MongoDB connection string
- Twilio credentials (accountSid and authToken)

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
2. Access the application at: `http://localhost:3000`

## Project Structure

- `server.js` - Main application file
- `models/` - Database models
  - `GroceryList.js` - Grocery list schema
  - `TotalGrocery.js` - Total grocery management
  - `signinConsumer.js` - Consumer authentication
  - `signinFarmer.js` - Farmer authentication
  - `signinLogistics.js` - Logistics authentication
- `views/` - EJS template files

## Security Notes

- Passwords are hashed using bcrypt
- Sensitive credentials should be moved to environment variables
- Session management is implemented for user authentication

## License

ISC
