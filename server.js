
const path = require("path");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const routes = require("./controllers");
const helpers = require("./utils/helpers");
const helmet = require("helmet"); // Helmet for HTTP security headers
const cors = require("cors"); // CORS middleware
const rateLimit = require("express-rate-limit");
const packRoutes = require("./controllers/api/packRoutes")

const sequelize = require("./config/connection");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;


const hbs = exphbs.create({ helpers });

const sess = {
  secret: process.env.SESS_SECRET,
  cookie: {
    maxAge: 3 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static('public'));
app.use('/', packRoutes);


// Helmet middleware for setting various HTTP headers for security
//app.use(helmet());

// CORS middleware to enable Cross-Origin Resource Sharing
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () =>
    console.log(`\n\nNow listening at http://localhost:${PORT}`)
  );
});