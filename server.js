/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */
const got = require("got");
const geoip = require("geoip-lite");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: true
});

/**
 * Our home page route
 *
 * Returns src/pages/index.hbs with data built into it
 */
fastify.get("/", async function(request, reply) {
  let ip = request.headers['x-forwarded-for'].split(',')[0];
  let geoloc = geoip.lookup(ip);
  console.info({geoloc});
  let times = await got(
    `https://www.hebcal.com/shabbat?cfg=json&geo=pos&latitude=${geoloc.ll[0]}&longitude=${geoloc.ll[1]}&tzid=${geoloc.timezone}&M=on`
  ).json();
  let candle = times.items.filter(x => x.title.includes("Candle"))[0].title;
  let Havdalah = times.items.filter(x => x.title.includes("Havdalah"))[0].title;

  reply.send(
    JSON.stringify(
      {
        geoloc,
        ip,
        times: "\n" + candle + "\n" + Havdalah
      },
      null,
      2
    )
  );
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
