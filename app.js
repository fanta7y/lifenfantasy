let err = false;
const http = require('http');
const express = require('express');
const fs = require('fs');
const bcrypt = require("bcrypt");
const path = require('path');
const multer = require('multer');
const mysql = require('mysql');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
let promocode = '17F-SKWNH&-L45W5M-201X';
require('dotenv').config();
let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});
let upload = multer({ storage: storage });
const app = express();
const session = require('express-session');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
function isAuth (req, res, next) {
    if (req.session.auth) {
        req.session.error = false;
        next();
    } else {
        index(promocode, "Ошибка: Вы не авторизованы!", req, res);
    }
}
function isAdmin(req, res, next) {
    if (req.session.admin == promocode) {
        let err = false;
        next();
    } else {
        index(promocode, "Ошибка: Недостаточно прав!", req, res);
    }
}
/* Путь к директории файлов ресурсов */
app.use(express.static('public'));

// Настройка шаблонизатора
app.set('view engine', 'ejs');

//Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
server.listen(1313, "0.0.0.0", () => {
    console.log('Запуск сервера...');
    setTimeout(function() {
        console.log('Сервер запущен');
    }, 1300);    
});

app.use(session({
    secret: 'Secret',
    resave: false,
    saveUninitialized: true
}));
io.on('connection', (socket, req, res) => {
    socket.on('chat message', async (msg) => {
        await prisma.message.create({
            data: {
                user_id: msg.id,
                text: msg.content,
                team: 1,
                recipient: 'team',
            },
        })
        io.emit('chat message', {
            'emoji': msg.emoji,
            'content': msg.content,
            'user': msg.user,
            'id': msg.id,
    });
        //'<span class="nickname">' + msg.user + '</span>' + ': ' + msg.content);
    });
});
app.get('/msg', isAuth, async (req, res) => {
    // select from database and pass data to render
    let msg = await prisma.message.findMany({
        where: {
            team: 1
        },
        include: {
            User: true
        }
    })
    function splitString(stringToSplit) {
        var arrayOfStrings = stringToSplit.split(" ");
        return arrayOfStrings;
        }
    let name = splitString(req.session.name);
    active = 'pass';
        res.render('msg', {
            'sess': req.session.vkid,
            'sessname': name[0],
            'sessava': req.session.emoji,
            'auth': true,
            'act': active,
            'mess': msg,
            'ava': req.session.emoji,
        });
        });

    // });
    app.post('/upload', isAuth, upload.single('file'), async (req, res, next) => {
        const { name, text, location_id } = req.body;
        const { originalname } = req.file;
            await prisma.item.create({
                data: {
                    title: name,
                    text,
                    filename: originalname,
                    location_id: location_id,
                }
            });
            res.redirect('/');
        });
        app.post('/submit', async (req, res, next) => {
            const { id } = req.body;
            let data = await prisma.offer.findFirst({
                where: {
                    id: Number(id)
                }
            });
            const { title, text, filename, author } = data;
            await prisma.item.create({
               data: {
                    title,
                    text,
                    filename,
                    location_id: author,
               } 
            });
            await prisma.offer.delete({
                where: {
                    id: Number(id)
                }
            });
            res.redirect('/');
        });
            
    let active;
    app.post('/offer', upload.single('file'), async (req, res, next) => {
        const { name, text, author, location_id } = req.body;
        await prisma.offer.create({
            data: {
                title: name,
                text,
                filename: req.file.originalname,
                author,
            }
        });
        res.redirect("/");
    });
app.get('/page', (req, res) => {
res.redirect('/page/' + req.session.vkid);
})
async function index(promocode, mirror, req, res){
    const item = await prisma.item.findMany({
        include: {
            location: true,
            categories: {
                include: {
                    category: true,
                }
            },
        }
    });
    const cats = await prisma.category.findMany({
    });
    const off = await prisma.Offer.findMany({
    });
    res.render('index', {
        'all': true,
        'many': off.length,
        'items': (item) ? item : {},
        'error': mirror,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,
        'admin': req.session.admin,
        'promocode': promocode,
        'act': "index",
        'dot': (cats) ? cats : {}
                
    });
}
    app.get('/', (req, res) => {
        index(promocode, false, req, res);
    });

app.get('/photo', isAuth, (req,res) => {
    active = 'app';
    res.render('form', {
        'admin': req.session.admin,
        'promocode': promocode,
        'act': active,
        'vkid': req.session.vkid,
        'auth': req.session.auth,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,
        'act': active,
    });
})

// 'name': req.session.name,
// 'vkid': req.session.vkid,
// 'id': req.session.id,
// 'emoji': req.session.emoji,
// 'userinfo': req.session.text,
// 'tel': req.session.tel,
// 'gender': req.session.gender,
// 'auth': req.session.auth,
app.get('/news-video', (req,res) => {
    active = 'nv';
    res.render('news-video', {
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active
    });
})

app.get('/news-post', (req,res) => {
    active = 'np';
    res.render('news-post', {
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active,

    }
    );
})

app.get('/app', (req,res) => {
    active = 'app';
    res.render('app', {
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active,

    });
});
app.post('/delete', isAuth, isAdmin, async (req, res) => {
    await prisma.itemRelCategory.deleteMany({
        where: {
            item_id: Number(req.body.id)
        }
    })
    await prisma.item.delete({
        where: {
            id: Number(req.body.id)
        }
    })
    res.redirect('/');
});
app.post('/update', isAdmin, async (req,res) => {
    let source = Number(req.body.id);
    const { title, text, id } = req.body;
    await prisma.item.update({
        where: {id: Number(id)},
        data: {
            title,
            text
        }
    })
    res.redirect('/');
});
app.get('/passport/reg', (req,res) => {
    active = 'pass';
    res.render('reg', {
        'error': false,
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active,

    }
    );
});
app.get('/passport/input', (req,res) => {
    active = 'pass';
    let loginerr = '';
    res.render('input', {
        'error': loginerr,
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active,

    }
    );
});
app.post('/reg', (req, res) => {
    if(req.body.vkid != '' && req.body.username != '' && req.body.userpass != '' && req.body.phone != '' && req.body.date != '') {
        let salt = 10;
        const { username, vkid, userpass, phone, Gender, text, emoji, date, private} = req.body;
        bcrypt.hash(userpass, salt, async (err, password) => {
                    await prisma.user.create({
                        data: {
                            username: username,
                            vkid: vkid,
                            password: password,
                            Phone: phone,
                            Gender: Number(Gender),
                            Info: text,
                            Emoji: emoji,
                            date: date,
                            private: private
                        }
                    });
                    let a = await prisma.user.findFirst({
                        where: {
                            vkid: vkid,
                            password: password,
                        }
                    })
                    let data = [];
                    data.push(a);
                            req.session.admin = data[0].private;
                            req.session.name = data[0].name;
                            req.session.vkid = data[0].vkid;
                            req.session.id = data[0].id;
                            req.session.emoji = data[0].Emoji;
                            req.session.text = data[0].Info;
                            req.session.tel = data[0].Phone;
                            req.session.gender = data[0].Gender;
                            req.session.auth = true;

                            res.redirect('/');
        });
    } else {
        active = 'pass';
        res.render('reg', {
            'error': 'Не оставляйте поля пустыми!',
            'name': req.session.name,
            'vkid': req.session.vkid,
            'id': req.session.id,
            'emoji': req.session.emoji,
            'userinfo': req.session.text,
            'tel': req.session.tel,
            'gender': req.session.gender,
            'auth': req.session.auth,        
            'act': active,
        });
    }
});

app.post('/login', async (req, res) => {
    let error = false;
    let data = new Array;
    data.push(await prisma.user.findFirst({
        where: {
            vkid: req.body.vkid,
        }
    }));
    
            if(data[0] != null) {
            bcrypt.compare(req.body.pass, data[0].password, (err, result) => {
            
            
        if(result) {
            req.session.admin = data[0].private;
            req.session.name = data[0].username;
            req.session.vkid = data[0].vkid;
            req.session.id = data[0].id;
            req.session.emoji = data[0].Emoji;
            req.session.text = data[0].Info;
            req.session.tel = data[0].Phone;
            req.session.gender = data[0].Gender;
            req.session.auth = true;
            res.redirect('/');
        } else{
            res.render('input', {
                'error': 'Ошибка: пользователь не найден. Проверьте правильность написания логина и пароля!',
                'act': active,
                'name': req.session.username,
                'vkid': req.session.vkid,
                'id': req.session.id,
                'emoji': req.session.emoji,
                'userinfo': req.session.text,
                'tel': req.session.tel,
                'gender': req.session.gender,
                'auth': req.session.auth,        
                'act': active,
            });
            }
        });
        } else {
            res.render('input', {
                'error': 'Ошибка: пользователь не найден. Проверьте правильность написания логина и пароля!',
                'act': active,
                'name': req.session.name,
                'vkid': req.session.vkid,
                'id': req.session.id,
                'emoji': req.session.emoji,
                'userinfo': req.session.text,
                'tel': req.session.tel,
                'gender': req.session.gender,
                'auth': req.session.auth,        
                'act': active,
            });
        }
    });  

app.post('/logout', isAuth, (req, res) => {
    req.session.auth = false;  
    res.redirect('/');
});

    

app.get('/offerlist',  async (req, res) => {
    const data = await prisma.Offer.findMany({

    });
        active = 'index';
        res.render('offers', {
            'admin': req.session.admin,
            'promocode': promocode,
            'error': req.session.error,
            'name': req.session.name,
            'vkid': req.session.vkid,
            'id': req.session.id,
            'emoji': req.session.emoji,
            'userinfo': req.session.text,
            'tel': req.session.tel,
            'gender': req.session.gender,
            'auth': req.session.auth,
            'act': active,
            'Items': data,
        });
    }
    );
app.post('/deleteof', isAuth, isAdmin, async (req, res) => {
    await prisma.offer.delete({
        where: {
            id: Number(req.body.id)
        }
    })
    res.redirect('/');
});
app.post('/delmsg', async (req, res) => {
    const { msgid } = req.body;
    await prisma.message.delete({
        where: {
            id: Number(msgid)
        }
    })
    res.redirect('/msg');
});

app.post('/cat', async (req, res) => {
    if(req.body.name != '') {
    await prisma.category.create({
        data: {
            title:  req.body.name,
            descr: req.body.descr,
            color: req.body.clr
        }
    });
            res.redirect('/');
    } else {
        let error = "Ошибка: название не может быть пустым!";
        index(promocode, error, req, res);
    }
});
app.get('/catform', isAuth, (req, res) => {
    res.render('catadd', {
        'act': "app",    
        'auth': req.session.auth
    });
})
app.get('/page/:id', async (req, res) => {
    let data = await prisma.user.findFirst({
        where: {
            vkid: req.params.id,
        }
    });
    
    res.render('page', {
        'userdata': data,
        'params': req.params.id,
        'admin': req.session.admin,
        'promocode': promocode,
        'act': "pass",
        'Items': data,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'userId': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,
    });
}); 

app.get('/items/:id', async (req, res) => {
    const { id } = req.params;
    const data = await prisma.item.findFirst({
        where: {
            id: Number(id),
        },
        include: {
            location: true,
            categories: {
                include: {
                    category: true,
                }
            },
        }
    });
    let a = new Array;
    a.push(data);
    let b = a[0].categories;

    b = b.map(el => {
        return el.category;
    });
        res.render('item', {
            'thisa': b,
            'params': req.params.id,
            'admin': req.session.admin,
            'promocode': promocode,
            'act': "index",
            'Items': a,
            'name': req.session.name,
            'vkid': req.session.vkid,
            'userId': req.session.id,
            'emoji': req.session.emoji,
            'userinfo': req.session.text,
            'tel': req.session.tel,
            'gender': req.session.gender,
            'auth': req.session.auth,
        });
});

app.get('/catto/:id', isAuth, async (req,res) => {
    let item = await prisma.itemRelCategory.findMany({
        where: {
            item_id: Number(req.params.id)
        },
    });
    item = item.map(el => {
        return el.category_id;
    });
    let data = await prisma.category.findMany({
        where: {
            id: { in: item }
        }
    });
    let notin = await prisma.category.findMany({
        where: {
            NOT:  {
                id: {
                    in: item
                }
            }
        }
    });
    res.render('numb', {
        'data': data,
        'notin': notin,
        'params': req.params.id,
        'admin': req.session.admin,
        'promocode': promocode,
        'Items': data,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'userId': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,
        'act': "app"
    });
});
app.post('/catadd', async (req, res) => {
    let cats = true;
    if (req.body.catID != []) {
    cats = req.body.catID;
    }
    let items = req.body.id;
    if(cats != undefined) {
        let b = new Array;
        let a = new Array;
        for(let i = 0; i < cats.length; i++) {
            b.push(items);
            b.push(cats[i]);
            a.push(b);
            b = [];
        }
        await prisma.itemRelCategory.deleteMany({
            where: {
               item_id: Number(items)
            }
        });
        let c;
        for(let i = 0; i < a.length; i++) {
            let c = a[i];
            await prisma.itemRelCategory.create({
                data: {
                    item_id: Number(c[0]),
                    category_id: Number(c[1])
                }
            });
    }
            res.redirect('/catto/' + items);
    } else {
        await prisma.itemRelCategory.deleteMany({
            where: {
                item_id: Number(items)
            }
        });
            res.redirect('/catto/' + items);
    }
});

app.get('/home/:id', async (req, res) => {
    if(req.params.id == 'all') {
        res.redirect('/');
    }
    let want = await prisma.itemRelCategory.findMany({
        where: {
            category_id: Number(req.params.id)
        }
    })
    let data = (await prisma.item.findMany()).length;
    if (err) console.log(err);
    want = want.map(el => {
        return el.item_id;
    });
    if(want.length == 0 || want == '') {
        mirror = 'Ошибка: В данной категории нет объектов!';
        index(promocode, mirror, req, res);
    } else {
        data = await prisma.item.findMany({
            where: {
                id: {
                    in: want
                }
            }
        })
        let mirror;       
        let dot = await prisma.category.findMany();
                mirror = false;
            res.render('home', {
                'items': data,
                'all': false,
                'error': mirror,
                'dot': dot,
                'act': 'index',
                'params': req.params.id,
                'admin': req.session.admin,
                'promocode': promocode,
                'Items': data,
                'many': dot.length,
                'name': req.session.name,
                'vkid': req.session.vkid,
                'userId': req.session.id,
                'emoji': req.session.emoji,
                'userinfo': req.session.text,
                'tel': req.session.tel,
                'gender': req.session.gender,
                'auth': req.session.auth,
        });
    }
});