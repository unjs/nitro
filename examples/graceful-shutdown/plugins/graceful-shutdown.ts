const delay = (sec: number) => new Promise(resolve => setTimeout(resolve, sec * 1000))

async function disconnectDatabase() {
  await delay(3)
}

export default defineNitroPlugin((_nitroApp) => {
  _nitroApp.hooks.hookOnce('close', async () => {
    console.log('disconnects database...')
    // something you want to do, such like disconnected the database, or wait the task is done
    await disconnectDatabase()
    console.log('database is disconnected!')
  })
});
