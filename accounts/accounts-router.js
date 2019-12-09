const express = require("express");
const knex = require("../data/dbConfig");
const router = express.Router();

// Verifies that the ID that is being passed into the URL exists
function validateId(req, res, next) {
  knex
    .select("*")
    .from("accounts")
    .where({ id: req.params.id })
    .first()
    .then(account => {
      if (account) {
        req.account = account;
        next();
      } else {
        res
          .status(404)
          .json({ error: "The specific account ID does not exist." });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: "Unable to obtain the specified ID." });
    });
}

// Verifies
function validatePost(req, res, next) {
  if (!req.body.name) {
    res.status(400).json({ message: "Please enter a name for your account." });
  } else if (!req.body.budget) {
    res
      .status(400)
      .json({ message: "Please enter a budget for your account." });
  } else {
    req.accountData = req.body;
    next();
  }
}

router.get("/", (req, res) => {
  knex
    .select("*")
    .from("accounts")
    .then(response => {
      res.status(200).json(response);
    })
    .catch(error => {
      console.log(error);
      res
        .status(500)
        .json({ error: "Unable to retrieve account information." });
    });
});

router.get("/:id", validateId, (req, res) => {
  res.send(req.account);
});

router.post("/", validatePost, (req, res) => {
  const accountData = req.accountData;

  knex("accounts")
    .insert(accountData, "id")
    .then(ids => {
      const id = ids[0];

      return knex("accounts")
        .select("id", "name", "budget")
        .where({ id })
        .first()
        .then(account => {
          res.status(201).json(account);
        });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: "Unable to add a new account." });
    });
});

router.delete("/:id", validateId, (req, res) => {
  const { id } = req.params;

  knex("accounts")
    .where({ id })
    .del()
    .then(response => {
      res.status(200).json({ message: `You deleted ${response} record(s).` });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: "Unable to delete the account." });
    });
});

router.put("/:id", validateId, (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  knex("accounts")
    .where({ id })
    .update(changes)
    .then(response => {
      res.status(200).json({ message: `You updated ${response} record(s).` });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: "Unable to update the account." });
    });
});

module.exports = router;
