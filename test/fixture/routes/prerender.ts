import { appendHeader } from "h3";

export default defineEventHandler((event) => {
  const links = [
    "/404",
    "https://about.google/products/",
    "/api/hello",
    "/api/hello?bar=baz",
    "/prerender#foo",
    "../api/hey",
    "/api/param/foo.json",
    "/api/param/foo.css",
  ];

  appendHeader(
    event,
    "x-nitro-prerender",
    "/api/param/prerender1, /api/param/prerender2"
  );
  appendHeader(event, "x-nitro-prerender", "/api/param/prerender3");

  return `<!DOCTYPE html><html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Prerendered routes test</title>
</head>
<body>
  <h1>Prerendered routes test:</h1>
  <ul>
${links.map((link) => `    <li><a href="${link}">${link}</a></li>`).join("\n")}
  </ul>
  <!-- Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ac fermentum tortor, vitae semper nisl. Morbi eu ex sed lacus mollis mollis vel nec mi. Aenean tincidunt pretium ligula, at dapibus libero vestibulum vel. Nunc in lorem vitae tortor lacinia cursus. Morbi malesuada nunc vel mi ornare, a iaculis magna molestie. In dictum, ex quis euismod semper, augue diam convallis nisi, vitae ullamcorper urna augue vel metus. Cras risus elit, tempus ac pretium quis, gravida id odio. Curabitur posuere diam vel leo imperdiet porttitor. Cras posuere hendrerit porta. In tellus velit, sagittis et scelerisque ultrices, iaculis ut leo. Proin id nibh blandit, pharetra lorem et, feugiat dui. Morbi hendrerit massa nec mauris aliquet ultrices. -->
</body>
</html>`;
});
