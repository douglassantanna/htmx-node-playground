import express from "express";
import path from 'path';
import axios from "axios";
import xss from "xss";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
let counter = 0;
let currentTemp = 20;
const contacts = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Heart', email: 'jane@example.com' },
  { name: 'Alice Smith', email: 'alice@example.com' },
  { name: 'Bob Williams', email: 'bob@example.com' },
  { name: 'Mary Harris', email: 'mary@example.com' },
  { name: 'David Mitchell', email: 'david@example.com' },
];

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//parse url encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

//parse JSON bodies (as sent by API clients)
app.use(express.json());

// handle home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'index.html'));
});

// handle post request for temp conversion
app.post('/convert', (req, res) => {
  setTimeout(() => {
    const fahrenheit = parseFloat(req.body.fahrenheit);
    const celsius = (fahrenheit - 32) * (5 / 9);

    res.send(`
        <p>
            ${fahrenheit} degrees Fahrenheit is equal to ${celsius} degrees Celsius.
        </p>
        `);
  }, 2000);
});

//handle get request for polling example
app.get('/poll-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'poll.html'));
});

app.get('/polling', (req, res) => {
  counter++;
  res.send(`<h2>${counter}</h2>`);
});

// handle weather page
app.get('/weather-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'weather.html'));
});

//handle get request for weather
app.get('/get-temp', (req, res) => {
  currentTemp += Math.random() + 2 - 1; //random temp change
  res.send(currentTemp.toFixed(1) + '*C');
});

app.get('/temp-conversion-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'temp-conversion.html'))
});


// handle users table
app.get('/users-table-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'users-table.html'))
});

app.post('/users-search', (req, res) => {
  const searchTerm = req.body.search.toLowerCase();

  if (!searchTerm) {
    return res.send('<tr></tr>');
  }

  const searchResults = contacts.filter((contact) => {
    const name = contact.name.toLowerCase();
    const email = contact.email.toLowerCase();

    return name.includes(searchTerm) || email.includes(searchTerm);
  });

  setTimeout(() => {
    const searchResultHtml = searchResults
      .map(
        (contact) => `
        <tr>
          <td><div class="my-4 p-2">${contact.name}</div></td>
          <td><div class="my-4 p-2">${contact.email}</div></td>
        </tr>
      `
      )
      .join('');

    res.send(searchResultHtml);
  }, 1000);
});

// Handle POST request for contacts search from jsonplaceholder
app.get('/search-users-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'search-users.html'));
});

app.post('/search/api', async (req, res) => {
  const searchTerm = req.body.search.toLowerCase();

  if (!searchTerm) {
    return res.send('<tr></tr>');
  }

  const response = await axios.get(`https://jsonplaceholder.typicode.com/users`);
  const contacts = await response.data;

  const searchResults = contacts.filter((contact) => {
    const name = contact.name.toLowerCase();
    const email = contact.email.toLowerCase();

    return name.includes(searchTerm) || email.includes(searchTerm);
  });

  setTimeout(() => {
    const searchResultHtml = searchResults
      .map(
        (contact) => `
        <tr>
          <td><div class="my-4 p-2">${contact.name}</div></td>
          <td><div class="my-4 p-2">${contact.email}</div></td>
        </tr>
      `
      )
      .join('');

    res.send(searchResultHtml);
  }, 1000);
});

//handle get users
app.get('/fetch-users-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'fetch-users.html'))
});

app.get("/users", async (req, res) => {
  setTimeout(async () => {
    const limit = +req.query.limit || 10;

    try {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/users?_limit=${limit}`);
      const users = await response.data;

      res.send(`
          <h1 class="text-2xl font-bold my-4" >Users</h1>
          <ul>
              ${users.map((user) => `<li>${user.name}</li>`).join('')}
          </ul>
          `);
    }
    catch (err) {
      console.log('Error fetching users:', err);
      res.status(500).send('Error fetching users');
    }
  }, 2000);
});

// Handle POST request for email validation
app.get('/email-validation-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'email-validation.html'))
});

app.post('/contact/email', (req, res) => {
  const submittedEmail = req.body.email;
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

  const isValid = {
    message: 'That email is valid',
    class: 'text-green-700',
  };

  const isInvalid = {
    message: 'Please enter a valid email address',
    class: 'text-red-700',
  };

  if (!emailRegex.test(submittedEmail)) {
    return res.send(
      `
        <div class="mb-4" hx-target="this" hx-swap="outerHTML">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email"
          >Email Address</label
        >
        <input
          name="email"
          hx-post="/contact/email"
          class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:border-blue-500"
          type="email"
          id="email"
          value="${submittedEmail}"
          required
        />
        <div class="${isInvalid.class}">${isInvalid.message}</div>
      </div>
        `
    );
  } else {
    return res.send(
      `
        <div class="mb-4" hx-target="this" hx-swap="outerHTML">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email"
          >Email Address</label
        >
        <input
          name="email"
          hx-post="/contact/email"
          class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:border-blue-500"
          type="email"
          id="email"
          value="${submittedEmail}"
          required
        />
        <div class="${isValid.class}">${isValid.message}</div>
      </div>
        `
    );
  }
});

// Handle GET request for profile edit
app.get('/profile-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'profile.html'))
});

app.get('/profile/:id/edit', (req, res) => {
  // You can send an HTML form for editing here
  res.send(`
    <div
    class="container mx-auto py-8 max-w-lg"
    hx-target="this"
    hx-swap="outerHTML"
  >
  <form hx-put="/profile/1" hx-target="this" hx-swap="outerHTML">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="mb-4">
          <label for="name" class="text-lg font-semibold">Name</label>
          <input type="text" id="name" name="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400" value="John Doe">
        </div>
        <div class="mb-4">
          <label for="bio" class="text-lg font-semibold">Bio</label>
          <textarea id="bio" name="bio" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400" rows="6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vestibulum vestibulum elit, ac facilisis ipsum eleifend sed. Duis tincidunt augue nec neque cursus, nec aliquet purus tempor.</textarea>
        </div>
        <div class="mt-6">
        <button type="submit" class="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600">Save Changes</button>
        <button type="button" hx-get="/profile-page" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg ml-2 hover:bg-gray-400">Cancel</button>
      </div>
      </div>
    </form>
  </div>
    `);
});

// Handle PUT request for editing
app.put('/profile/:id', (req, res) => {
  const name = xss(req.body.name);
  const bio = xss(req.body.bio);

  // Send the updated profile back
  res.send(`
    <div
    class="container mx-auto py-8 max-w-lg"
    hx-target="this"
    hx-swap="outerHTML"
  >
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-4">${name}</h1>
      <p class="text-gray-700">
        ${bio}
      </p>

      <button
        hx-get="/profile/1/edit"
        class="bg-indigo-700 text-white font-bold w-full py-2 px-4 rounded-lg mt-4 hover:bg-indigo-600"
      >
        Click To Edit
      </button>
    </div>
  </div>
    `);
});

//start server
app.listen(3000, () => { console.log("Server listening on port 3000 \u{1F525}") });