const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const GroceryList = require('./models/GroceryList');
const TotalGrocery = require('./models/TotalGrocery');
const consumerSchema=require("./models/signinConsumer");
const farmerSchema=require("./models/signinFarmer");
const logisticsSchema=require("./models/signinLogistics");
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(bodyParser.json()); // To parse JSON data

app.set('view engine', 'ejs');
app.set('views', './views'); // Ensure the `views` directory exists
// Twilio credentials
const accountSid = '  ';
const authToken = '  ';
const client = twilio(accountSid, authToken);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/groceryDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.get("/", (req, res) => {
  res.render("index");
})


app.post("/submit-role", (req, res) => {
  const selectedRole = req.body.role; // Get the role from the form submission

  // Redirect to the corresponding login page based on the selected role
  if (selectedRole === "consumer") {
    res.redirect("/signinConsumer");
  } else if (selectedRole === "logistics") {
    res.redirect("/signinLogistics");
  } else if (selectedRole === "farmer") {
    res.redirect("/signinFarmer");
  }
});


app.get("/signinConsumer", async (req, res) => {
  res.render("signinConsumer");
})

app.post("/signinConsumer", async (req, res) => {

  const { name, phone, apartment,password } = req.body;

  const consumer = new consumerSchema({
    name,
    phone,
    apartment,
    password,
  });

  await consumer.save();

  res.redirect("/submit-grocery");
})

app.get("/loginConsumer", async (req, res) => {
  res.render("loginConsumer");
})

app.post("/loginConsumer", async (req, res) => {
  const { name, phone, apartment, password } = req.body;

  try {
    // Find the consumer based on the phone number
    const consumer = await consumerSchema.findOne({ phone });

    if (!consumer) {
      // If the consumer doesn't exist, send an error response
      return res.status(400).render('loginConsumer', {
        errorMessage: 'No account found with that phone number.'
      });
    }

    // Check if the password matches the hashed password stored in the database
    const isPasswordMatch = await bcrypt.compare(password, consumer.password);

    if (!isPasswordMatch) {
      // If the password doesn't match, send an error response
      return res.status(400).render('loginConsumer', {
        errorMessage: 'Incorrect password.'
      });
    }

    // If login is successful, redirect to a dashboard or home page
    res.redirect('/submit-grocery'); // Redirect to the consumer dashboard or desired page
  } catch (err) {
    // Handle any errors that occur during the process
    console.error(err);
    res.status(500).render('loginConsumer', {
      errorMessage: 'An error occurred. Please try again later.'
    });
  }
});


app.get("/signinFarmer", async (req, res) => {
  res.render("signinFarmer");
})

app.post("/signinFarmer", async (req, res) => {
  const { name,password } = req.body;
  const farmer = new farmerSchema({
    name,
    password,
  });

  await farmer.save();
  res.redirect("/generate-total-grocery");
})

app.get("/loginFarmer",async (req, res) => {
  res.render("loginFarmer");
})

app.post("/loginFarmer", async (req, res) => {
  const { name, password } = req.body;

  try {
    // Find the farmer by name
    const farmer = await farmerSchema.findOne({ name });

    if (!farmer) {
      // If the farmer doesn't exist, send an error response
      return res.status(400).render('loginFarmer', {
        errorMessage: 'No account found with that name.'
      });
    }

    // Check if the entered password matches the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, farmer.password);

    if (!isPasswordMatch) {
      // If the password doesn't match, send an error response
      return res.status(400).render('loginFarmer', {
        errorMessage: 'Incorrect password.'
      });
    }

    // If login is successful, redirect to the farmer's dashboard or desired page
    res.redirect("/generate-total-grocery"); // Redirect to the farmer dashboard or any other page
  } catch (err) {
    // Handle any errors that occur during the login process
    console.error(err);
    res.status(500).render('loginFarmer', {
      errorMessage: 'An error occurred. Please try again later.'
    });
  }
});



app.get("/signinLogistics",async (req, res) => {
  res.render("signinLogistics");
})

app.post("/signinLogistics",async (req, res) => {

  const { name, phone, location, password } = req.body;
  const logistics = new logisticsSchema({
    name,
    password,
    phone,
    location
  });

  await logistics.save();

  res.redirect("/generate-total-grocery");
})


app.get("/loginLogistics",async (req, res) => {
  res.render("loginLogistics");
})

app.post("/loginLogistics", async (req, res) => {
  const { name, password } = req.body;

  try {
    // Find the logistics by name
    const logistics = await logisticsSchema.findOne({ name });

    if (!logistics) {
      // If no logistics are found with that name, show an error message
      return res.status(400).render('loginLogistics', {
        errorMessage: 'No account found with that name.'
      });
    }

    // Compare the entered password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, logistics.password);

    if (!isPasswordMatch) {
      // If the password doesn't match, show an error message
      return res.status(400).render('loginLogistics', {
        errorMessage: 'Incorrect password.'
      });
    }

    // If login is successful, redirect to the logistics dashboard or any other page
    res.redirect("/generate-total-grocery"); // Redirect to the logistics dashboard
  } catch (err) {
    // Handle any errors that occur during the login process
    console.error(err);
    res.status(500).render('loginLogistics', {
      errorMessage: 'An error occurred. Please try again later.'
    });
  }
});









app.get("/submit-grocery",async (req, res) => {
  res.render("grossery");
})



app.post('/submit-grocery', async (req, res) => {
  try {
    const { apartmentId, houseId, groceryItems } = req.body;

    // Check if groceryItems is an array
    if (!Array.isArray(groceryItems)) {
      return res.status(400).json({ error: 'Invalid grocery items format.' });
    }

    // Parse the groceryItems (you may already have them as an array, so this might not be necessary)
    groceryItems.forEach((item) => {
      if (item.quantity) {
        item.quantity = parseInt(item.quantity, 10);  // Convert quantity to number
      }
    });

    // Ensure apartmentId and houseId are provided
    if (!apartmentId || !houseId) {
      return res.status(400).json({ error: 'Invalid data. Please check your input.' });
    }

    // Create a new GroceryList document
    const newGroceryList = new GroceryList({
      apartmentId,
      houseId,
      groceryItems,
    });

    // Save the document to the database
    await newGroceryList.save();

    res.redirect("/submit-grocery");
  } catch (error) {
    console.error('Error saving grocery list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to generate and send total grocery list to farmers
app.get('/generate-total-grocery', async (req, res) => {
  try {
    // Fetch all grocery lists from the database
    const groceryLists = await GroceryList.find();

    // Aggregate total grocery items for each apartment
    const aggregatedData = {};

    groceryLists.forEach(list => {
      const apartmentId = list.apartmentId;

      // Initialize if apartment not in the aggregated data
      if (!aggregatedData[apartmentId]) {
        aggregatedData[apartmentId] = [];
      }

      // Aggregate items for the current apartment
      list.groceryItems.forEach(item => {
        const existingItem = aggregatedData[apartmentId].find(t => t.item === item.item);
        if (existingItem) {
          existingItem.totalQuantity += item.quantity;
        } else {
          aggregatedData[apartmentId].push({
            item: item.item,
            totalQuantity: item.quantity
          });
        }
      });
    });

    // Send total grocery list for each apartment to farmers
    const farmersPhoneNumbers = ['+918867337907']; // Replace with actual farmer numbers

    for (const apartmentId in aggregatedData) {
      const totalItems = aggregatedData[apartmentId];
      const message = `Grocery list for apartment ${apartmentId}: ${JSON.stringify(totalItems)}`;

      // Send SMS to farmers
      farmersPhoneNumbers.forEach(phoneNumber => {
        client.messages.create({
          body: message,
          from: '+16504144480', // Replace with your Twilio number
          to: phoneNumber
        }).then(message => console.log(`Message sent to ${phoneNumber}: ${message.sid}`));
      });

      // Save aggregated grocery data into the TotalGrocery collection
      let totalGrocery = await TotalGrocery.findOne({ apartmentId });

      if (!totalGrocery) {
        // If not found, create a new entry
        totalGrocery = new TotalGrocery({
          apartmentId,
          totalItems,
          status: 'Pending'  // Set default status to 'Pending'
        });
      } else {
        // If found, update the existing entry with the new totalItems
        totalGrocery.totalItems = totalItems;
      }

      // Save the updated or newly created document in the database
      await totalGrocery.save();
      console.log(`Total grocery data saved for apartment ${apartmentId}`);
    }

    // Send aggregated data to EJS for display
    res.render('total-grocery', { aggregatedData });

  } catch (error) {
    console.error('Error generating total grocery list:', error);
    res.status(500).send('Internal server error');
  }
});






// Endpoint for farmers to confirm if they can supply the groceries
app.post('/confirm-farmer/:apartmentId', async (req, res) => {
  const { apartmentId } = req.params;  // Capturing apartmentId from the URL
  const { canSupply } = req.body;  // Capturing the confirmation (true/false) from the form
  console.log(apartmentId);
  try {
    // Find the total grocery list for the apartment
    const totalGrocery = await TotalGrocery.findOne({ apartmentId: String(apartmentId) });
    console.log(totalGrocery);
    // Update the status based on whether the farmer can supply or not
    if (canSupply) {
      totalGrocery.status = 'Confirmed';
    } else {
      totalGrocery.status = 'Rejected';
    }

    // Save the updated status to the database
    await totalGrocery.save();

    // Define the logistics phone numbers
    const logisticsPhoneNumbers = ['+918867337907'];  // Replace with actual logistics numbers
    const message = `The grocery list for apartment ${apartmentId} has been ${totalGrocery.status}.`;

    // Send SMS to logistics
    for (const phoneNumber of logisticsPhoneNumbers) {
      await client.messages.create({
        body: message,
        from: '+16504144480',  // Replace with your Twilio phone number
        to: phoneNumber
      });

      console.log(`Message sent to logistics: ${message}`);
    }

    const groceryLists = await GroceryList.find();

  // Aggregate total grocery items for each apartment
  const aggregatedData = {};

  groceryLists.forEach(list => {
    const apartmentId = list.apartmentId;

    // Initialize if apartment not in the aggregated data
    if (!aggregatedData[apartmentId]) {
      aggregatedData[apartmentId] = [];
    }

    // Aggregate items for the current apartment
    list.groceryItems.forEach(item => {
      const existingItem = aggregatedData[apartmentId].find(t => t.item === item.item);
      if (existingItem) {
        existingItem.totalQuantity += item.quantity;
      } else {
        aggregatedData[apartmentId].push({
          item: item.item,
          totalQuantity: item.quantity
        });
      }
    });
  });


  res.render("total-grocery",{aggregatedData});

  } catch (error) {
    // Handle any errors
    console.error('Error processing farmer confirmation:', error);
    res.status(500).send('Error updating confirmation and sending message');
  }
});






app.get('/send-logistics-charge/:apartmentId', (req, res) => {
  const { apartmentId } = req.params;  // Capture apartmentId from the URL

  // Optionally set response message and color based on query parameters
  const responseMessage = req.query.successMessage || null;
  const responseColor = req.query.responseColor || 'green';  // Default to 'green'

  // Send apartmentId along with the responseMessage and responseColor to the EJS view
  res.render('logisticsForm', { apartmentId, responseMessage, responseColor });
});


// Endpoint to send logistics charge info to customers
app.post('/confirm-logistics/:apartmentId', async (req, res) => {
  const { apartmentId, logisticsCharge } = req.body;

  // Get customer phone numbers for the apartment
  const customersPhoneNumbers = ['+918867337907']; // List of customer phone numbers

  const message = `The logistics charge for your grocery order in apartment ${apartmentId} is ${logisticsCharge}`;

  customersPhoneNumbers.forEach(phoneNumber => {
    client.messages.create({
      body: message,
      from: '+16504144480',
      to: phoneNumber
    }).then(message => console.log(message.sid));
  });



  const groceryLists = await GroceryList.find();

  // Aggregate total grocery items for each apartment
  const aggregatedData = {};

  groceryLists.forEach(list => {
    const apartmentId = list.apartmentId;

    // Initialize if apartment not in the aggregated data
    if (!aggregatedData[apartmentId]) {
      aggregatedData[apartmentId] = [];
    }

    // Aggregate items for the current apartment
    list.groceryItems.forEach(item => {
      const existingItem = aggregatedData[apartmentId].find(t => t.item === item.item);
      if (existingItem) {
        existingItem.totalQuantity += item.quantity;
      } else {
        aggregatedData[apartmentId].push({
          item: item.item,
          totalQuantity: item.quantity
        });
      }
    });
  });


  res.render("total-grocery",{aggregatedData});
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
