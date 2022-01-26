
export default (req, res, next) => {
  console.log('middleware!')
  next()
}
