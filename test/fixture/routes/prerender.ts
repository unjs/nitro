export default defineEventHandler(() => {
  const links = [
    'https://about.google/products/',
    '/api/hello'
  ]
  return `
    <ul>
    ${links.map(link => `<li><a href="${link}">${link}</a></li>`).join('\n')}
  `
})
