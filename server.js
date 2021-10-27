const got = require("got");
const geoip = require("geoip-lite");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

fastify.get("/", async function(request, reply) {
  let ip = request.headers['x-forwarded-for'].split(',')[0];
  let geoloc = geoip.lookup(ip);
  let times = await got(
    `https://www.hebcal.com/shabbat?cfg=json&geo=pos&latitude=${geoloc.ll[0]}&longitude=${geoloc.ll[1]}&tzid=${geoloc.timezone}&M=on`
  ).json();
  console.info({geoloc, times, items: times.items})
  let candle = times.items.find(x => x.category.includes("candles")).title;
  let havdalah = times.items.find(x => x.category.includes("havdalah")).title;
  let parashat = times.items.find(x => x.category.includes('parashat')).hebrew;

  reply.type('application/json').send(
    JSON.stringify(
      {
        geoloc,
        ip,
        parashat,
        times: `In: ${geoloc.city}\n${candle}\n${havdalah}\n${parashat}`
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
