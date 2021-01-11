const jsftp = require("jsftp");
const fs = require('fs')
const path = require('path')

let defaultFtpPath = ''
const localTempFile = 'tempContent.txt'


let ftp = new jsftp({
  host: '1.1.1.1',
  port: 21,
  user: 'user',
  pass: 'pass'
});

(async () => {
  let accessesList = await getAccesses()

  let tempContentData = await fs.promises.readFile(localTempFile)
  let bufContent = Buffer.from(tempContentData.toString(), 'utf-8');

const replObj = { neogara: "1", global: "0", neogara_js: "0" }


  // for (let accessesObj of accessesList) {
  for (let i = 0; i < accessesList.length; i++) {
    ftp = new jsftp({
      host: accessesList[i].host,
      port: 21,
      user: accessesList[i].user,
      pass: accessesList[i].pass
    })
    await fixDefaultRemotePath()

    // console.log(`${accessesList[i].domain} content: ${await getFileContent('index.php')}`)

    // const replacedContent = tempContentData.toString().replace('replaseyandexmetrika', accessesList[i].yandex)
    // let bufContent = Buffer.from(replacedContent.toString(), 'utf-8');
    // console.log(`${i+1}_ ${accessesList[i].domain}: ${await setFileContent(bufContent, 'functions/send.php')}`)

    // console.log(`${accessesList[i].domain}: ${await fixSettingsJson()}`);

    // console.log(`${i+1}_ ${accessesList[i].domain}: ${await setMetrika(accessesList[i].yandex)}`);
    // console.log(`${i+1}_ ${accessesList[i].domain}: ${await changeSettingsByParam('pid', accessesList[i].additionals[0])}`);
    // console.log(`${i+1}_ ${accessesList[i].domain}: ${await changeSettingsByParam('cloakit', accessesList[i].additionals[0])}`);
    // console.log(`${i+1}_ ${accessesList[i].domain}: ${await changeSettingsByParam('group', '6')}`);

    // console.log(`${accessesList[i].domain}: ${await createFile('settings.json', bufContent)}`);

    // console.log(`${i + 1} ${accessesList[i].domain} > ${await replaceFileContent('kod.php', `token=c744d8285b9b9a`, '')}`);
    // console.log(`${i + 1} ${accessesList[i].domain} > ${await replaceFileContent('kod.php', `<script type='text/javascript' src='//www.youtube.com/iframe_api'></script>`, '')}`);

    // console.log(await loadIndexSaveTitle('kod.php', tempContentData.toString()));
    
    
    console.log(`${i + 1}_ ${accessesList[i].domain}: ${await renameFile("/public/index.php","/public/registration.php")}`);



    // console.log(`${accessesList[i].domain}: ${await loadIndexSaveTitle('kod.php', tempContentData)}`);


    if (ftp) {
      ftp.socket.destroy()
      ftp.destroy();
      ftp = null;
    }
  }

})()


async function getAccesses() {
  const data = await fs.promises.readFile('./accesses.txt', {
    encoding: 'utf-8'
  })
  const accessesLines = data.split('\r\n')
  let accessesList = []
  for (let line of accessesLines) {
    let accessesObj = line.split('|||')
    accessesList.push({
      domain: accessesObj[0],
      host: accessesObj[1],
      user: accessesObj[2],
      pass: accessesObj[3],
      yandex: accessesObj[4] || '',
      additionals: accessesObj.reduce((acc, cur) => {
        if (accessesObj.indexOf(cur) > 4) {
          acc.push(cur);
        }
        return acc;
      }, [])
    })
  }


  // const a = [1, 2, 3, 4, 5];

  // const res = a.reduce((acc, cur) => {
  //   if (a.indexOf(cur) > 3) {
  //     acc.push(cur);
  //   }
  //   return acc;
  // }, [])

  return accessesList
}

async function getFiles(path = '.') {
  return new Promise((resolve, reject) => {
    try {
      let data = ftp.ls(defaultFtpPath + path, function (err, res) {
        if (err) reject(err)
        resolve(res);
      })
      return data;
    } catch (error) {
      return error
    }
  })
}

async function getFileContent(path = '') {
  return new Promise((resolve, reject) => {
    try {
      let data = ftp.get(defaultFtpPath + path, (err, socket) => {
        let str = ''
        if (err) reject(err)

        socket.on("data", d => {
          str += d.toString();
        });

        socket.on("end", () => {
          resolve(str.toString());
        });

        socket.on("close", err => {
          if (err) console.error("There was an error retrieving the file.")
        });
        socket.resume();
      })
      return data
    } catch (error) {
      return error
    }
  })
}

async function setFileContent(content, path) {
  if (!path || !content) return false

  return new Promise((resolve, reject) => {
    try {
      let data = ftp.put(content, defaultFtpPath + path, err => {
        if (err) reject(err)
        resolve(true)
      })
      return data
    } catch (error) {
      // console.log(`setFileContent: ${error}`);
      return error
    }
  })
}
async function renameFile(from, to) {
  if (!from || !to) return false

  return new Promise((resolve, reject) => {
    try {
      ftp.rename(defaultFtpPath +from, defaultFtpPath + to, (err, res) => {
        if (err) reject(err)
        resolve(true)
      });
    } catch (error) {
      return error
    }
  })
}
async function fixDefaultRemotePath() {
  let filesList = await getFiles()
  let containPublicHtml = false
  let containIndex = false
  for (let file of filesList) {
    if (file.name.includes('public_html')) containPublicHtml = true
    if (file.name.includes('index.php')) containIndex = true
  }
  if (containPublicHtml && !containIndex) defaultFtpPath = 'public_html/'
}

async function fixSettingsJson() {
  const settingsPath = 'settings.json'
  const settingsJson = await getFileContent(settingsPath)
  const settingsObj = JSON.parse(settingsJson)
  const settingsJsonPattern = {
    offer: settingsObj.offer || '0',
    pid: settingsObj.pid || '0',
    return: settingsObj.return || 'thanks.php',
    yandex: settingsObj.yandex || '',
    facebook: settingsObj.facebook || '',
    partners: {
      global: settingsObj.partners.global || '1',
      neogara: settingsObj.partners.neogara || '0',
      partner: settingsObj.partners.partner || '0'
    },
    language: settingsObj.language || 'RU',
    sitename: /*settingsObj.sitename ||*/ 'Общее Дело'
  }
  // const settingsJsonPattern = {
  //   offer: '0',
  //   pid: '0',
  //   return: 'thanks.php',
  //   yandex: settingsObj.yandex || '',
  //   facebook: settingsObj.facebook || '',
  //   partners: {
  //     global: '1',
  //     neogara: '0',
  //     partner: '0'
  //   },
  //   language: 'RU',
  //   sitename: 'Общее Дело'
  // }
  const settingsString = JSON.stringify(settingsJsonPattern, null, "\t")
  const settingsBuffer = Buffer.from(settingsString, "utf-8")
  return await setFileContent(settingsBuffer, settingsPath)
}

async function setMetrika(id) {
  const settingsPath = 'settings.json'
  const settingsJson = await getFileContent(settingsPath)
  const settingsObj = JSON.parse(settingsJson)
  settingsObj.yandex = id
  const settingsString = JSON.stringify(settingsObj, null, "\t")
  const settingsBuffer = Buffer.from(settingsString, "utf-8")
  return await setFileContent(settingsBuffer, settingsPath)
}

async function createFile(path, content = '') {
  if (path) {
    return new Promise((resolve, reject) => {
      try {
        const data = ftp.put(content, defaultFtpPath + path, (err) => {
          // assert.ok(!hadError);
          if (err) reject(err)
          resolve(true)
        })
        return data
      } catch (error) {
        return error
      }
    })
  } else console.log('path can not be empty');
}

async function replaceFileContent(path, find, replace) {
  const remoteFileContent = await getFileContent(path)

  if (remoteFileContent.includes(find)) {
    const replacedContent = remoteFileContent.replace(new RegExp(find.toString(), 'g'), replace)
    const replacedContentBuffer = Buffer.from(replacedContent, "utf-8")
    return await setFileContent(replacedContentBuffer, path)
  } return false
}

async function changeSettingsByParam(param, value) {
  const settingsPath = 'settings.json'
  const settingsJson = await getFileContent(settingsPath)
  const settingsObj = JSON.parse(settingsJson)

  settingsObj[param] = value

  const settingsString = JSON.stringify(settingsObj, null, "\t")
  const settingsBuffer = Buffer.from(settingsString, "utf-8")
  return await setFileContent(settingsBuffer, settingsPath)
}

async function getIndexTitle(path) {
  const remoteFileContent = await getFileContent(path)
  if(!remoteFileContent) throw new Error('No data in file')

  const titleReg = /<title>(.*?)<\/title>/
  const title = remoteFileContent.toString().match(titleReg)[0]
  if (title.includes('<title>')) return title
  else throw new Error('Title not found')
}

async function loadIndexSaveTitle(path, content) {
  const prevTitle = getIndexTitle(path)
  const replacedContent = content.replace(new RegExp(`|||title|||`, 'g'), prevTitle)
  const replacedContentBuffer = Buffer.from(replacedContent, "utf-8")
  return await setFileContent(replacedContentBuffer, path)
}