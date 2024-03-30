const fetch = require("node-fetch");
const fs = require('fs')
const { exec } = require("child_process");
const clc = require('cli-color')
let packages = JSON.parse(fs.readFileSync("./package.json", {encoding:'utf8', flag:'r'}))
const readline = require("readline");
const { createDecipher } = require("crypto");

const rlp = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

let ask = async (data, functions)=>{

    return await new Promise((resolve, reject) => {
        rlp.question(data + " ", (input) => resolve(input));
    });

}

let config_start;
try {
  config_start = JSON.parse(
    fs.readFileSync("./config.json", { encoding: "utf8", flag: "r" })
  );
} catch (e) {
  console.log(e);
  config_start = {
    "license_key": "",

    "captcha_type": "capmonster",
    "captcha_key": "(Captcha Key)",
    "low_cost": true,

    "nocaptchaai_key": "(Required if transfer_after_daily = true)",
    "transfer_after_daily": false,
    "bot_token": "BOT TOKEN IN YOUR SERVER",
    "channel_id": "TRANSFER ID",
    "probotbot_id": "PROBOT ID",
    "ownerid": "BANK ID",

    "delay": 0.5,
    "proxyType": 1,
    "threads": 1,

    "launcher": false,

    "endpoint": "probot.io",
    "version_api": "1.0",
    "version_cdn": "1.0-beta"
}
  fs.writeFile("./config.json", JSON.stringify(config_start), function (err) {
    if (err) console.log(err);
  });
}

console.log("Started");

const oldRequire = require;

const cache = {};

require = (filename) => {
  if (!filename.includes("/")) {
    return oldRequire(filename);
  } else {
    let path = cache;
    let indexof = 0;

    let arr = filename.split("/");

    for (let f of arr) {
      if (!f.split("").find((m) => m !== ".")) {
        indexof++;
      } else if (arr[indexof + 1]) {
        indexof++;
        path = path[f];
      } else {
        return path[f];
      }
    }
  }
};

let login = async ()=>{

    let key = await ask(clc.yellow(`Welcome in y0gen, please type the licence key?`))

    config_start = JSON.parse(fs.readFileSync("./config.json", {encoding:'utf8', flag:'r'}))
    config_start.license_key = key
    setTimeout(() => {fs.writeFile("./config.json", JSON.stringify(config_start) , function(err) {if(err) console.log(err)}) }, 3000)
     await ask(clc.green(`Your key has been saved!`))

    return start()

}

let start = async () => {
//    if(!config_start.license_key) return login()

    console.log(`Looking for updates..`)

let dataFetch = await fetch((`https://y0topgg.y0host.net/api/version`), {
      headers: { }
});

let dataJSON = await dataFetch.json()

if(dataJSON.version_api !== config_start.version_api || dataJSON.version_cdn !== config_start.version_cdn) {
    console.log(`Find New Update!`);
}else{
    console.log(`No Update Find!`);
}

if(dataJSON.version_api !== config_start.version_api) {

    config_start.version_api = `${dataJSON.version_api}`;
    setTimeout(() => {fs.writeFile("./config.json", JSON.stringify(config_start) , function(err) {if(err) console.log(err)}) }, 3000)
    console.log(`Update For Download new API Has been completed`);

}
if (dataJSON.version_cdn !== config_start.version_cdn) {

    config_start.version_cdn = `${dataJSON.version_cdn}`;
    setTimeout(() => {fs.writeFile("./config.json", JSON.stringify(config_start) , function(err) {if(err) console.log(err)}) }, 3000)
    console.log(`Update For Download new CDN Has been completed`);

}

    console.log(`Looking for packages..`);

    var packages_api = []

    for(const key of Object.keys(dataJSON.packages[config_start.version_cdn])){
        
      packages_api.unshift({name: key, value: dataJSON.packages[config_start.version_cdn][key]})

    }

    var packages_installed = []

    for(const key of Object.keys(packages.dependencies)){
        
      packages_installed.unshift({name: key, value: packages.dependencies[key]})

    }


    var installs = []
    var changes = []
    var deletes = packages_installed.filter(z => !packages_api.find(x => x.name === z.name))

    for(const package of packages_api.filter(z => !packages_installed.find(x => x.name === z.name && x.value === z.value))){

       let find = packages_installed.find(z => z.name === package.name)
       if(!find) {installs.unshift({name: package.name, value: package.value}); continue;}

       if(find.value !== package.value) {changes.unshift({name: package.name, value: package.value}); continue;}

    }

if(installs.length !== 0 || changes.length !== 0 || deletes.length !== 0){
    
    console.log(`Find New packages!
    Update: ${changes.length}
    New: ${installs.length}
    Removed: ${deletes.length}`);

    for(const package of deletes){
     delete packages.dependencies[package.name]
    }

    for(const package of changes){
     packages.dependencies[package.name] = package.value
    }

    for(const package of installs){
     packages.dependencies[package.name] = package.value
    }
  console.log(`In Install..`);

   setTimeout(() => {fs.writeFile("./package.json", JSON.stringify(packages) , function(err) {if(err) console.log(err)}) }, 100)
   let installData = await new Promise((resolve, reject) => {
exec(`npm install`, (error, stdout, stderr) => {
  console.log(`Packages installed successfully!\nits Maybe stop code.`);
  resolve()
});
    })

}else{

    console.log(`No Update packages find!`);

}

  console.log('Looking for cache file')
  const cachesFiles = fs.readdirSync(`./.cache/`).filter(file => file.endsWith(".json"));

  let findFiles = cachesFiles.find(z => z.startsWith(`${dataJSON.cache[config_start.version_cdn]}-${config_start.version_cdn}`))

  if(findFiles){
      console.log('Finded Files')

  let data = JSON.parse(
    fs.readFileSync(`./.cache/${findFiles}`, { encoding: "utf8", flag: "r" })
  );

  let indexCode;
  let waitToload = {}

  for (var [filename, value] of Object.entries(data)) {
    if (typeof value === "object") {
      cache[filename] = {};
      for (let [fname, code] of Object.entries(value)) {
        cache[filename][fname] = {};

        if (typeof code === "object") {
          for (let [name_file, file] of Object.entries(code)) {
            cache[filename][fname][name_file] = {};

            if (typeof file === "object") {
              for (let [file_name, file_code] of Object.entries(code)) {
                cache[filename][fname][name_file][file_name] = {};

                cache[filename][fname][name_file][file_name] = eval(file_code);
              }
            } else {
              if(name_file.endsWith('.html')) {
                cache[filename][fname][name_file] = file
              }else{
              cache[filename][fname][name_file] = eval(file);
            }}
          }
        } else {
          console.log(filename, fname)
          if(fname.endsWith('.html')) {
            cache[filename][fname] = code
          }else{
          cache[filename][fname] = eval(code);
        }}
      }
    } else {
      if (filename === "index.js") {
        indexCode = value;
        continue;
      } else if (
        ["js", "json"].includes(
          filename.split(".")[filename.split(".").length - 1]
        )
      ) {
        if(!cache['ws'] || !cache['ws']['index.js']) {
          waitToload[filename] = value
          cache[filename] = value
        }else{
        cache[filename] = eval(value);
        }
      } else {
        cache[filename] = value;
      }
    }
  }

  setTimeout(()=>{

    console.log(Object.keys(waitToload))

    for(const key of Object.keys(waitToload)){

      let value = waitToload[key]

      cache[key] = eval(value);

    }

  }, 1500)

  setTimeout(() => {

    cache["index.js"] = eval(indexCode);
  }, 3000);

  }else{
  console.log('Download files..')

  let response = await fetch(`https://y0topgg.y0host.net/api/files/${config_start.version_cdn}`, {
    method: "GET",
    headers: {  },
  });
  let data = await response.json();

  if(data.message) return console.log(clc.red(data.message));
  await new Promise(async (res, req) => {
 fs.writeFile(`./.cache/${dataJSON.cache[config_start.version_cdn]}-${config_start.version_cdn}.json`, JSON.stringify(data), (err) => {
  if (err) {
    console.error(err);
    return;
  }
    console.log('Download!')
    res()
});

  })
  console.log('Start Load..')

  let indexCode;

  let waitToload = {}

  for (var [filename, value] of Object.entries(data)) {
    if (typeof value === "object") {
      cache[filename] = {};
      for (let [fname, code] of Object.entries(value)) {
        cache[filename][fname] = {};

        if (typeof code === "object") {
          for (let [name_file, file] of Object.entries(code)) {
            cache[filename][fname][name_file] = {};

            if (typeof file === "object") {
              for (let [file_name, file_code] of Object.entries(code)) {
                cache[filename][fname][name_file][file_name] = {};

                cache[filename][fname][name_file][file_name] = eval(file_code);
              }
            } else {
              if(name_file.endsWith('.html')) {
                cache[filename][fname][name_file] = file
              }else{
              cache[filename][fname][name_file] = eval(file);
            }}
          }
        } else {
          if(fname.endsWith('.html')) {
            cache[filename][fname] = code
          }else{
          cache[filename][fname] = eval(code);
        }}
      }
    } else {
      if (filename === "index.js") {
        indexCode = value;
        continue;
      } else if (
        ["js", "json"].includes(
          filename.split(".")[filename.split(".").length - 1]
        )
      ) {
        if(!cache['ws'] || !cache['ws']['index.js']) {
          waitToload[filename] = value
          cache[filename] = value
        }else{
        cache[filename] = eval(value);
        }
      } else {
        cache[filename] = value;
      }
    }
  }

  setTimeout(()=>{

    console.log(Object.keys(waitToload))

    for(const key of Object.keys(waitToload)){

      let value = waitToload[key]

      cache[key] = eval(value);

    }

  }, 1500)

  setTimeout(() => {

    cache["index.js"] = eval(indexCode);
  }, 3000);
}
};
start();
