const router = require("express").Router();
const { User, Collection } = require("../../models");
const nodemailer = require("nodemailer");
const withAuth = require("../../utils/auth");

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

router.post("/", async (req, res) => {
  try {
    const userData = await User.create(req.body);

    const newCollection = await Collection.create({
      user_id: userData.id,
      id: userData.id,
    });
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      const mailOptions = {
        from: "mtgdeckbuilder22@outlook.com", // Sender’s email address
        to: `${req.body.email}`, // Recipient’s email address
        subject: "Thank you for signing up for Spellsmith!", // Email subject
        text: `Thank you for creating an account!
        Please Visit at https://spellsmith-mvp-65f389051aae.herokuapp.com/
        `, // Email body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email: " + error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);
    console.log(validPassword);
    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.json({ user: userData, message: "You are now logged in!" });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/logout", (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

router.put("/update", withAuth, async (req, res) => {
  try {
    const updatedPassword = req.body.newPassword;
    const user_id = req.session.user_id;
    const userData = await User.findOne({ where: { id: user_id } });

    const validPassword = await userData.checkPassword(req.body.password);
    if (!validPassword) {
      res.status(400).json({ message: "Incorrect password, please try again" });
      return;
    }
    // console.log(updatedPassword);

    await userData.update({
      password: updatedPassword,
    });
    res.status(200).json("Password Updated!");
  } catch (error) {
    res.status(400).json(error);
  }
});

// Route to delete a user's account
router.delete("/delete", withAuth, async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const userData = await User.findOne({ where: { id: user_id } });

    const validPassword = await userData.checkPassword(req.body.passwordVerify);

    if (!validPassword) {
      res.status(400).json({ message: "Incorrect password, please try again" });
      return;
    }
    const removedCard = await User.destroy({
      where: {
        id: user_id,
      },
    });
    if (req.session.logged_in) {
      req.session.destroy(() => {
        res.status(204).end();
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
