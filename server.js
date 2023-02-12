const path = require("path");
const axios = require("axios");

const fastify = require("fastify")({
  logger: false,
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastify.register(require("fastify-formbody"));

fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// ------------------- ROUTER ------------------- //

fastify.get("/", function (request, reply) {
  reply.view("/src/pages/index.hbs");
});

fastify.post("/", function (request, reply) {
  console.log(request);

  axios
    .post(
      "https://api.openai.com/v1/engines/text-davinci-edit-001/edits",
      {
        instruction:
          "Group the items on this grocery list by aisle in a grocery store.",
        temperature: 0,
        input: request.body.input,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      console.log(`statusCode: ${res.status}`);
      console.log(res);

      let params = {
        input: request.body.input,
        output: res.data.choices[0].text,
      };

      // request.body.paramName <-- a form post example
      reply.view("/src/pages/index.hbs", params);
    })
    .catch((error) => {
      console.error(error);
    });
});

// ---------------------------------------------- //

fastify.listen(process.env.PORT, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
